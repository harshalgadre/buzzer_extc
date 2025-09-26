const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenario: {
    type: String,
    required: true
  },
  meetingUrl: {
    type: String,
    required: true
  },
  isDesktopCall: {
    type: Boolean,
    default: false
  },
  liveCoding: {
    type: Boolean,
    default: false
  },
  aiInterview: {
    type: Boolean,
    default: false
  },
  position: {
    type: String
  },
  company: {
    type: String
  },
  meetingLanguage: {
    type: String,
    default: 'english'
  },
  translationLanguage: {
    type: String,
    default: 'english'
  },
  resume: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', sessionSchema);
