const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Initialize Google client (use env var)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register - Website registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('fullName').notEmpty().trim().escape(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { email, fullName, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user (password hashing handled by pre-save hook)
    user = new User({
      email,
      fullName,
      password,
      provider: 'local'
    });

    await user.save();

    // Create JWT
    const token = user.getSignedJwtToken();

    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation errors:', errors.array());
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email); // From extension or web

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    console.log('User found:', user._id, 'Provider:', user.provider);

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user._id);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    console.log('Password matched for user:', user._id);

    // Create JWT
    const token = user.getSignedJwtToken();
    console.log('Login successful, token generated for user:', user._id);

    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/google - Google OAuth login/register
router.post('/google', [
  body('idToken').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { idToken } = req.body;

    // Verify ID token (requires GOOGLE_CLIENT_ID in .env)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ msg: 'Invalid Google token' });
    }

    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link Google account
        user.googleId = googleId;
        user.provider = 'google';
        await user.save();
      } else {
        // Create new user
        user = new User({
          email,
          fullName: name,
          googleId,
          provider: 'google'
        });
        await user.save();
      }
    }

    // Create JWT
    const token = user.getSignedJwtToken();

    res.json({ token, user: { id: user._id, email: user.email, name: user.fullName } });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: 'Google authentication failed' });
  }
});

router.get('/verify', (req, res) => {
  // Simple token verification endpoint
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.id });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
});

module.exports = router;
