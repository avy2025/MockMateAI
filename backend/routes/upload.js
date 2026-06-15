const express = require('express');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { resumeUpload } = require('../middleware/resumeMulter');
const { s3Client, bucketName, deleteFile } = require('../services/storageService');
const Resume = require('../models/Resume');
const { extractResumeText } = require('../utils/resumeExtractor');
const { chunkResumeText } = require('../utils/resumeChunker');
const { createResumeSession } = require('../services/resumeSessionStore');
const { generateResumeInsights } = require('../services/resumeInsights');
const {
  generateEmbeddings,
  stripEmbeddingsFromChunks,
} = require('../services/resumeEmbeddings');

const { protect } = require('../middleware/auth');

const router = express.Router();

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.once('end', () => resolve(Buffer.concat(chunks)));
    stream.once('error', reject);
  });

function removeUploadedFile(fileKey) {
  if (!fileKey) return;
  deleteFile(fileKey).catch(() => {});
}

// POST /api/upload-resume
router.post('/', protect, resumeUpload.single('resume'), async (req, res) => {
  const fileKey = req.file?.key;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    // Fetch the uploaded file from S3 to extract text in memory
    const getObjCmd = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });
    const s3Response = await s3Client.send(getObjCmd);
    const buffer = await streamToBuffer(s3Response.Body);

    let extractedText;
    try {
      extractedText = await extractResumeText(buffer, req.file.originalname);
    } catch (parseError) {
      removeUploadedFile(fileKey);

      if (parseError.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: parseError.message,
        });
      }

      console.error('Resume parse error:', parseError);
      return res.status(422).json({
        success: false,
        message:
          'Could not read this file. It may be corrupted or not a valid PDF/DOCX.',
      });
    }

    if (!extractedText) {
      removeUploadedFile(fileKey);
      return res.status(422).json({
        success: false,
        message:
          'No readable text was found in this resume. Try a different file or ensure the document contains selectable text.',
      });
    }

    const chunks = chunkResumeText(extractedText);
    const [embeddedChunks, insights] = await Promise.all([
      generateEmbeddings(chunks),
      generateResumeInsights(extractedText, chunks),
    ]);
    
    // Save metadata to MongoDB
    await Resume.create({
      user: req.user.id,
      fileUrl: req.file.location, // Provides the full S3 URL
      storageKey: req.file.key,
      fileType: req.file.mimetype,
      insights,
    });

    const sessionId = await createResumeSession({
      filename: req.file.originalname,
      extractedText,
      chunks: embeddedChunks,
      insights,
    }, req.user.id);

    // Generate signed URL for frontend preview
    const { getSignedUrl } = require('../services/storageService');
    const signedUrl = await getSignedUrl(req.file.key, 3600);

    // We do NOT remove the file from S3, as instructed to keep it permanently.

    res.json({
      success: true,
      filename: req.file.originalname,
      extractedText,
      sessionId,
      chunks: stripEmbeddingsFromChunks(embeddedChunks),
      insights,
      // Provide storageKey back to frontend for preview logic if needed (they'll use GetSignedUrl API anyway or we can give one)
      storageKey: req.file.key,
      signedUrl
    });
  } catch (error) {
    removeUploadedFile(fileKey);
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed.',
    });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload failed.',
    });
  }

  next();
});

module.exports = router;
