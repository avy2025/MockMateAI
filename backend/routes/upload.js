const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { resumeUpload } = require('../middleware/resumeMulter');
const { extractResumeText } = require('../utils/resumeExtractor');

const router = express.Router();

function removeUploadedFile(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
}

// POST /api/upload-resume
router.post('/', resumeUpload.single('resume'), async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    let extractedText;
    try {
      extractedText = await extractResumeText(filePath);
    } catch (parseError) {
      removeUploadedFile(filePath);

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
      removeUploadedFile(filePath);
      return res.status(422).json({
        success: false,
        message:
          'No readable text was found in this resume. Try a different file or ensure the document contains selectable text.',
      });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      extractedText,
    });
  } catch (error) {
    removeUploadedFile(filePath);
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
