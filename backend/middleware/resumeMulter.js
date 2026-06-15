const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { s3Client, bucketName } = require('../services/storageService');

const storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resumes/resume-${uniqueSuffix}${ext}`);
  },
});

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedExtensions = ['.pdf', '.docx'];

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { resumeUpload };
