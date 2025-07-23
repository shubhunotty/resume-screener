import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useRefresh } from '../context/RefreshContext';

const Navbar = () => {
  const [count, setCount] = useState(0);
  const { refreshToken } = useRefresh();
  const location = useLocation();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/resume/summary`);
        setCount(res.data.totalCount || 0);
      } catch (err) {
        console.error('Failed to fetch resume count:', err);
      }
    };

    fetchCount();
  }, [refreshToken, location.pathname]);

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between">
      <h1 className="text-lg font-bold">📄 Resume Screener</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Upload</Link>
        <Link to="/resumes" className="hover:underline">
          Resumes {count > 0 && <span className="bg-blue-600 rounded px-2 py-0.5 ml-1">{count}</span>}
        </Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      </div>
    </nav>
  );
};

export default Navbar;
