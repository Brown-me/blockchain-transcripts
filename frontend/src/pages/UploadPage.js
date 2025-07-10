// src/pages/UploadPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { hashFile } from '../utils/hashFile';
import Spinner from '../components/Spinner';
import { parseEthersError } from '../utils/parseEthersError';

console.log("REACT_APP_BACKEND_URL =", process.env.REACT_APP_BACKEND_URL);


export default function UploadPage() {
  const [form, setForm]         = useState({ matricNumber:'', name:'', course:'', grade:'' });
  const [file, setFile]         = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleChange = e => {
    setError(''); setSuccess(''); setDownloadUrl('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async e => {
    setError(''); setSuccess(''); setDownloadUrl('');
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      return setError('Only PDF files are allowed.');
    }
    setFile(selected);
    setLoading(true);
    try {
      const hash = await hashFile(selected);
      setFileHash(hash);
    } catch {
      setError('Failed to hash file.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setDownloadUrl('');

    // validations
    if (!form.matricNumber.match(/^[A-Za-z0-9]+$/)) {
      return setError('Invalid matric number format.');
    }
    if (!fileHash) {
      return setError('Please select a PDF and wait for its hash.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('matricNumber', form.matricNumber);
      formData.append('documentHash', fileHash);
      formData.append(
        'metadata',
        JSON.stringify({ name: form.name, course: form.course, grade: form.grade })
      );
      formData.append('file', file);

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );


      setSuccess('Transcript uploaded successfully!');
      setDownloadUrl(res.data.fileUrl);

      // reset form
      setForm({ matricNumber:'', name:'', course:'', grade:'' });
      setFile(null);
      setFileHash('');
    } catch (err) {
      const msg =
        parseEthersError(err) ||
        err.response?.data?.error ||
        'Upload failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-lightBg rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Upload Transcript</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="matricNumber"
          placeholder="Matric Number"
          value={form.matricNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-darkBg placeholder-gray-400 focus:outline-accent"
          required
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full text-gray-300"
          required
        />
        {fileHash && <p className="text-sm break-all text-gray-200">Hash: {fileHash}</p>}

        <input
          name="name"
          placeholder="Student Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-darkBg placeholder-gray-400 focus:outline-accent"
          required
        />

        <input
          name="course"
          placeholder="Course"
          value={form.course}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-darkBg placeholder-gray-400 focus:outline-accent"
          required
        />

        <input
          name="grade"
          placeholder="Grade"
          value={form.grade}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-darkBg placeholder-gray-400 focus:outline-accent"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-primary hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Spinner /> : 'Upload'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {/* Only render when we truly have a URL */}
      {success && downloadUrl && (
        <div className="mt-4">
          <p className="text-green-400">{success}</p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-accent"
          >
            Download Transcript
          </a>
        </div>
      )}
    </div>
  );
}
