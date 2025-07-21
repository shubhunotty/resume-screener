const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  fileName: String,
  email: String,
  phone: String,
  preview: String,
  skills: [String],
  notes: String,
  tags: [String],
  suggestions: {
    jobTitle: String,
    experienceLevel: String,
    summary: String,
  },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
