const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const InterviewSession = require('../models/InterviewSession');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// POST /api/sessions - Create new interview session

router.post('/', auth, [
  body('scenario').notEmpty().trim(),
  body('meetingUrl').optional().isURL(),
  body('position').optional().trim().escape(),
  body('company').optional().trim().escape(),
  body('meetingLanguage').optional().isIn(['english', 'spanish', 'french', 'german', 'hindi']), // Add more as needed
  body('translationLanguage').optional().isIn(['english', 'spanish', 'french', 'german', 'hindi']),
  body('resume').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { scenario, meetingUrl, isDesktopCall, liveCoding, aiInterview, position, company, meetingLanguage, translationLanguage, resume } = req.body;

    const session = new InterviewSession({
      userId: req.user.id,
      scenario,
      meetingUrl,
      isDesktopCall: isDesktopCall || false,
      liveCoding: liveCoding || false,
      aiInterview: aiInterview || false,
      position,
      company,
      meetingLanguage: meetingLanguage || 'english',
      translationLanguage: translationLanguage || 'english',
      resume
    });

    await session.save();

    res.status(201).json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/sessions - Get user's interview sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit for performance

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/sessions/:sessionId - Get specific session
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/sessions/:sessionId/ai-interaction - Save AI interaction
router.post('/:sessionId/ai-interaction', auth, async (req, res) => {
  try {
    const { interviewerText, aiResponse, userText } = req.body;
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    session.aiInteractions.push({ interviewerText, aiResponse, userText });
    await session.save();
    res.json({ msg: 'Interaction saved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/sessions/:sessionId/generate-ai-response - Generate AI response
router.post('/:sessionId/generate-ai-response', auth, async (req, res) => {
  try {
    const { question, prompt } = req.body;
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt || `As an interview coach for ${session.position} at ${session.company}, answer this question: ${question}. Keep it concise and helpful.` }] }]
      })
    });
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid API response:', data);
      return res.status(500).json({ msg: 'Invalid AI response' });
    }
    const aiText = data.candidates[0].content.parts[0].text;
    res.json({ response: aiText });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/transcribe - Transcribe audio using Gemini
router.post('/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file provided' });
    }
    const audioBuffer = fs.readFileSync(req.file.path);
    const base64Audio = audioBuffer.toString('base64');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Transcribe this audio to text.' },
            { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
          ]
        }]
      })
    });
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid transcription response:', data);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ msg: 'Invalid transcription response' });
    }
    const text = data.candidates[0].content.parts[0].text;
    fs.unlinkSync(req.file.path); // Clean up
    res.json({ text });
  } catch (err) {
    console.error(err.message);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ msg: 'Transcription failed' });
  }
});

module.exports = router;
