const fs = require('fs');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const Resume = require('../models/Resume');
const nlp = require('compromise');

// Predefined skills list for matching
const SKILLS = [
  'Java', 'JavaScript', 'React', 'Node.js', 'Python', 'HTML', 'CSS', 'MongoDB',
  'Express', 'SQL', 'Git', 'Docker', 'AWS', 'Azure', 'REST', 'Redux'
];

// 🔍 Extract matched skills from text
const extractSkills = (text) => {
  const foundSkills = SKILLS.filter(skill =>
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  return [...new Set(foundSkills)];
};

// 🧠 Try to extract name from early lines
const extractName = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (
      !line.match(/(@|[0-9]{3,}|linkedin\.com|github\.com)/i) &&
      line.split(' ').length <= 4 &&
      /^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/.test(line)
    ) {
      return line;
    }
  }

  return null;
};

// 🧠 Generate role & experience-based suggestions
const generateSuggestions = (text, skills) => {
  const titleMatch = text.match(/(frontend|backend|full[- ]?stack|data analyst|machine learning|devops|software|java|react) developer/i);
  const jobTitle = titleMatch ? titleMatch[0].replace(/[- ]?developer/i, ' Developer') : 'Software Developer';

  const experienceLevel = /(\b0[-–]?1\b|\bfresher\b)/i.test(text)
    ? 'Fresher'
    : /(\b[1-3]\b.*years?)/i.test(text)
    ? 'Junior'
    : /(\b[4-9]\b.*years?|\b\d{2,}\b.*months?)/i.test(text)
    ? 'Mid/Senior'
    : 'Unknown';

  const summary = `Recommended for ${jobTitle} role with ${experienceLevel} experience based on skills: ${skills.join(', ')}`;

  return { jobTitle, experienceLevel, summary };
};

// 📄 Parse resume PDF
const parseResume = async (req, res) => {
  try {
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    let text = '';

    try {
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text.trim();
    } catch {
      console.warn('PDF parse failed, falling back to textract...');
    }

    // Fallback for scanned/bad PDFs
    if (!text || text.length < 100) {
      text = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (error, result) => {
          if (error) reject(error);
          else resolve(result || '');
        });
      });
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    const phoneMatch = text.match(/(\+91[-\s]?|0)?[789]\d{9}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const skills = extractSkills(text);
    const name = extractName(text);
    const suggestions = generateSuggestions(text, skills);

    // ✨ Auto-tags from skills + experience + job title
    const tags = [
      ...skills.map(s => s.toLowerCase()),
      suggestions.experienceLevel.toLowerCase(),
      suggestions.jobTitle.replace(/\s+/g, '-').toLowerCase()
    ];

    const newResume = new Resume({
      fileName: req.file.originalname,
      email: emailMatch?.[0] || null,
      phone: phoneMatch?.[0] || null,
      preview: text.substring(0, 500),
      skills,
      suggestions,
      tags,
    });

    await newResume.save();

    res.json({
      success: true,
      extracted: {
        name: name || 'Not found',
        email: newResume.email || 'Not found',
        phone: newResume.phone || 'Not found',
        skills: skills.length ? skills : ['Not found'],
        preview: newResume.preview,
        suggestions,
        tags
      }
    });
  } catch (err) {
    console.error('❌ Resume parsing failed:', err);
    res.status(500).json({ success: false, message: "Parsing failed" });
  }
};

// 📄 Fetch all resumes
const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
};

// 🗑 Delete resume by ID
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await Resume.findByIdAndDelete(id);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

// ✏️ Update notes and tags
const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, tags } = req.body;

    const updated = await Resume.findByIdAndUpdate(
      id,
      { notes, tags },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update resume' });
  }
};

// 📊 Summary data for dashboard
const getSummary = async (req, res) => {
  try {
    const totalCount = await Resume.countDocuments();

    const topSkills = await Resume.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const byExperience = await Resume.aggregate([
      { $group: { _id: '$suggestions.experienceLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, totalCount, topSkills, byExperience });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ success: false, message: 'Failed to get summary' });
  }
};

module.exports = {
  parseResume,
  getAllResumes,
  deleteResume,
  updateResume,
  getSummary
};
