const express = require('express');
const multer = require('multer');
const { resumeUpload } = require('../middleware/resumeMulter');

const router = express.Router();

// POST /api/upload-resume
router.post('/', resumeUpload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
    });
  } catch (error) {
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
