const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const InterviewSession = require('../models/InterviewSession');

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

module.exports = router;
