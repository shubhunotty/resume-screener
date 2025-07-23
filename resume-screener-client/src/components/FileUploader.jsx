// top
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useRefresh } from '../context/RefreshContext';

const API_URL = process.env.REACT_APP_API_URL;

const FileUploader = () => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const { triggerRefresh } = useRefresh();
  const [loading, setLoading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      setUploadStatus('');
      const response = await axios.post(`${API_URL}/api/resume/parse`, formData);
      setParsedData(response.data.extracted);
      setUploadStatus('✅ Upload & Parsing successful!');
      triggerRefresh();
    } catch (error) {
      console.error(error);
      setUploadStatus('❌ Upload or Parsing failed.');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div {...getRootProps()} className="border-2 border-dashed p-6 rounded cursor-pointer text-center">
        <input {...getInputProps()} />
        <p>Drag & drop a resume PDF, or click to select</p>
      </div>

      {loading && <p className="mt-2 text-yellow-600 animate-pulse">⏳ Uploading and parsing...</p>}
      {!loading && uploadStatus && <p className="mt-2 text-blue-600">{uploadStatus}</p>}

      {parsedData && (
        <div className="mt-6 p-4 bg-white rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">Extracted Resume Data:</h2>
          <p><strong>Name:</strong> {parsedData.name || "Not found"}</p>
          <p><strong>Email:</strong> {parsedData.email || "Not found"}</p>
          <p><strong>Phone:</strong> {parsedData.phone || "Not found"}</p>
          <p><strong>Skills:</strong> {Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : "Not found"}</p>
          <p><strong>Preview:</strong> {parsedData.preview}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
