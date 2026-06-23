const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const InterviewRecording = require('../models/InterviewRecording');
const InterviewSession = require('../models/InterviewSession');
const { protect } = require('../middleware/auth');
const { s3Client, bucketName, getSignedUrl } = require('../services/storageService');
const logger = require('../utils/logger');

const router = express.Router();

// Setup cloud storage for recordings
const storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `recordings/recording-${req.params.sessionId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/**
 * @swagger
 * /api/recordings/upload/{sessionId}:
 *   post:
 *     summary: Upload an interview recording
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               recording:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Recording uploaded successfully
 */
router.post('/upload/:sessionId', protect, upload.single('recording'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No recording file uploaded.' });
    }

    const session = await InterviewSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to upload to this session.' });
    }

    const recording = await InterviewRecording.create({
      session: session._id,
      fileUrl: req.file.location,
      storageKey: req.file.key,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      duration: req.body.duration || 0,
    });

    session.recording = recording._id;
    await session.save();

    logger.info({
      msg: 'Interview recording uploaded',
      recordingId: recording._id,
      sessionId,
      size: req.file.size
    });

    res.json({ success: true, recordingId: recording._id, fileUrl: req.file.location });
  } catch (error) {
    logger.error({ msg: 'Recording Upload Error', error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/recordings/{sessionId}:
 *   get:
 *     summary: Get a signed URL for an interview recording
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to signed S3 URL
 *       404:
 *         description: Recording not found
 */
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ sessionId }).populate('recording');
    
    if (!session || !session.recording) {
      return res.status(404).json({ error: 'Recording not found.' });
    }

    if (!session.recording.storageKey) {
      return res.status(404).json({ error: 'File not found on cloud storage.' });
    }

    // Generate a pre-signed URL to privately access the S3 object
    const signedUrl = await getSignedUrl(session.recording.storageKey, 3600); // 1-hour expiration

    // Redirect the client to the S3 URL to stream the media securely
    res.redirect(signedUrl);
  } catch (error) {
    logger.error({ msg: 'Recording Fetch Error', error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
