import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRefresh } from '../context/RefreshContext';

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const { refreshToken, triggerRefresh } = useRefresh(); // ✅ fixed


  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/resume/all`);
      setResumes(res.data.resumes);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [refreshToken]);

  // Scroll-to-top logic
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
  if (window.confirm("Delete this resume?")) {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/resume/${id}`);
      triggerRefresh(); // 🔁 auto-refresh ResumeList, Dashboard, Navbar
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
};

  const handleSave = async (id, notes, tags) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/resume/${id}`, { notes, tags });
      fetchResumes();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <h2 className="text-2xl font-bold mb-4">📁 All Uploaded Resumes</h2>

      {loading ? (
        <p className="text-gray-500 text-center animate-pulse">⏳ Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <div className="text-gray-500 text-center p-6">📭 No resumes uploaded yet.</div>
      ) : (
        resumes.map(resume => (
          <div key={resume._id} className="bg-white shadow-md rounded p-4 mb-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">{resume.fileName}</h3>
              <button onClick={() => handleDelete(resume._id)} className="text-red-500">Delete</button>
            </div>
            <p><strong>📧 Email:</strong> {resume.email || 'Not found'}</p>
            <p><strong>📞 Phone:</strong> {resume.phone || 'Not found'}</p>
            <p><strong>🧠 Skills:</strong> {resume.skills?.join(', ') || 'Not found'}</p>
            <p><strong>📝 Preview:</strong> {resume.preview}</p>
            {resume.suggestions && (
              <p className="text-blue-600"><strong>💡 AI Suggestion:</strong> {resume.suggestions.summary}</p>
            )}
            <p className="text-sm text-gray-600">
              ⏱ Uploaded: {new Date(resume.uploadedAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>

            <div className="mt-3">
              <textarea
                placeholder="Add notes"
                className="w-full border p-2 rounded mb-2"
                defaultValue={resume.notes}
                onChange={(e) => resume.notes = e.target.value}
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full border p-2 rounded mb-2"
                defaultValue={resume.tags?.join(', ')}
                onChange={(e) => resume.tags = e.target.value.split(',').map(tag => tag.trim())}
              />
              <button
                onClick={() => handleSave(resume._id, resume.notes, resume.tags)}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        ))
      )}

      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700"
        >
          ⬆️ Back to Top
        </button>
      )}
    </div>
  );
};

export default ResumeList;
