// src/pages/VerifyPage.js
import React, { useState } from 'react';
import { verifyTranscript } from '../api';
import { hashFile } from '../utils/hashFile';
import Spinner from '../components/Spinner';
import { parseEthersError } from '../utils/parseEthersError';

export default function VerifyPage() {
  const [matric, setMatric]         = useState('');
  const [file, setFile]             = useState(null);
  const [fileHash, setFileHash]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  const handleFileChange = async e => {
    setError(''); setResult(null);
    const selected = e.target.files[0];
    if (!selected) return;
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
    setError(''); setResult(null);

    const payload = {};
    if (fileHash) payload.documentHash = fileHash;
    else if (matric) payload.matricNumber = matric.trim();
    else {
      return setError('Provide matric number or upload a file.');
    }

    setLoading(true);
    try {
      const res = await verifyTranscript(payload);
      setResult(res.data);
    } catch (err) {
      const msg = parseEthersError(err) || err.response?.data?.error || 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-lightBg rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Verify Transcript</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Matric Number"
          value={matric}
          onChange={e => { setMatric(e.target.value); setFileHash(''); }}
          className="w-full px-4 py-2 rounded bg-darkBg placeholder-gray-400 focus:outline-accent"
          disabled={!!file}
        />

        <div className="text-center text-gray-400">— OR —</div>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full text-gray-300"
          disabled={!!matric}
        />
        {fileHash && <p className="text-sm break-all text-gray-200">Hash: {fileHash}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-primary hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Spinner/> : 'Verify'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result && result.verified && (
        <div className="mt-6 p-4 bg-darkBg rounded space-y-2">
          <p className="text-green-400 font-semibold">✅ Verified</p>
          <p><strong>Name:</strong> {result.transcript.metadata.name}</p>
          <p><strong>Course:</strong> {result.transcript.metadata.course}</p>
          <p><strong>Grade:</strong> {result.transcript.metadata.grade}</p>

          {/* show matric if verified by file */}
          {fileHash && (
            <p><strong>Matric No:</strong> {result.transcript.matricNumber}</p>
          )}

          {/* download link */}
          {result.transcript.fileUrl && (
            <a
              href={result.transcript.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-accent"
            >
              Download Transcript
            </a>
          )}

          <p className="text-sm text-gray-400">
            Uploaded: {new Date(result.transcript.uploadedOnChainAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
