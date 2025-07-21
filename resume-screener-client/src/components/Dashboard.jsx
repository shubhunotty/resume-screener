import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRefresh } from '../context/RefreshContext';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshToken } = useRefresh();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/resume/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to load summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [refreshToken]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">📊 Loading dashboard data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">📊 Dashboard</h2>
      <p><strong>Total Resumes:</strong> {summary.totalCount}</p>

      <div>
        <h3 className="font-semibold">Top Skills:</h3>
        <ul className="list-disc pl-6">
          {summary.topSkills.map(skill => (
            <li key={skill._id}>{skill._id} ({skill.count})</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Experience Breakdown:</h3>
        <ul className="list-disc pl-6">
          {summary.byExperience.map(exp => (
            <li key={exp._id}>{exp._id || 'Unknown'} ({exp.count})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
