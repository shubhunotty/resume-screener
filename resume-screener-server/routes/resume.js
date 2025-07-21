const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const {
  parseResume,
  getAllResumes,
  deleteResume,
  updateResume,
  getSummary
} = require('../controllers/parseController');

// Upload & parse resume
router.post('/parse', upload.single('resume'), parseResume);

// Get all parsed resumes
router.get('/all', getAllResumes);

// 🗑 Delete a resume by ID
router.delete('/:id', deleteResume);

// ✏️ Update notes and tags of a resume
router.put('/:id', updateResume);

// uses Resume.aggregate(...)
router.get('/summary', getSummary);

module.exports = router;
