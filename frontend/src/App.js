// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage  from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import VerifyPage from './pages/VerifyPage';

export default function App() {
  const [user, setUser] = useState(null); // { address, isOwner }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <nav className="p-4 bg-lightBg flex justify-between">
        <div>
          {user.isOwner && <Link to="/upload" className="mr-4">Upload</Link>}
          <Link to="/verify">Verify</Link>
        </div>
        <div className="text-sm">👤 {user.address}</div>
      </nav>

      <Routes>
        {user.isOwner && <Route path="/upload" element={<UploadPage />} />}
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="*" element={<Navigate to={user.isOwner ? "/upload" : "/verify"} />} />
      </Routes>
    </BrowserRouter>
  );
}
