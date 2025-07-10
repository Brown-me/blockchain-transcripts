const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const pool    = require('../db');
const { transcriptContract } = require('../contract');

const router = express.Router();

// 1. Multer config: temp store with original filename
const upload = multer({ dest: 'uploads/tmp/' });

router.post('/', upload.single('file'), async (req, res) => {
  const { matricNumber, documentHash, metadata } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  try {
    // 2. Call smart contract
    const tx = await transcriptContract.uploadTranscript(matricNumber, documentHash);
    await tx.wait();

    // 3. Rename file: <uploads>/<documentHash>.pdf
    const ext = path.extname(file.originalname) || '.pdf';
    const newName = `${documentHash}${ext}`;
    const destPath = path.resolve('uploads', newName);
    await fs.promises.rename(file.path, destPath);

    // 4. Build download URL
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/${newName}`;

    // 5. Insert into MySQL, now including file_url
    await pool.execute(
      `INSERT INTO transcripts
         (matric_number, document_hash, metadata, file_url)
       VALUES (?, ?, ?, ?)`,
      [matricNumber, documentHash, JSON.stringify(metadata), fileUrl]
    );

    res.json({ success: true, message: 'Uploaded on‑chain & saved off‑chain.', fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
