const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InterviewRecording = require('../models/InterviewRecording');
const InterviewSession = require('../models/InterviewSession');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/recordings';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `recording-${req.params.sessionId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/**
 * POST /api/recordings/upload/:sessionId
 * Uploads a video/audio recording for a session.
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
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      duration: req.body.duration || 0,
    });

    session.recording = recording._id;
    await session.save();

    res.json({ success: true, recordingId: recording._id });
  } catch (error) {
    console.error('Recording Upload Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/recordings/:sessionId
 * Serves the recording file for the session.
 */
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ sessionId }).populate('recording');
    
    if (!session || !session.recording) {
      return res.status(404).json({ error: 'Recording not found.' });
    }

    const filePath = path.resolve(session.recording.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Recording Fetch Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
