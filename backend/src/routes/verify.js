// src/routes/verify.js
const express = require('express');
const pool = require('../db');
const { transcriptContract } = require('../contract');
const router = express.Router();

router.post('/', async (req, res) => {
  const { matricNumber, documentHash } = req.body;

  if (!matricNumber && !documentHash) {
    return res
      .status(400)
      .json({ error: 'Please provide either matricNumber or documentHash.' });
  }

  // Build query based on provided field(s)
  let query, params;
  if (matricNumber && documentHash) {
    query  = `SELECT * FROM transcripts WHERE matric_number = ? OR document_hash = ?`;
    params = [matricNumber, documentHash];
  } else if (matricNumber) {
    query  = `SELECT * FROM transcripts WHERE matric_number = ?`;
    params = [matricNumber];
  } else {
    query  = `SELECT * FROM transcripts WHERE document_hash = ?`;
    params = [documentHash];
  }

  try {
    // 1. Fetch off‑chain record
    const [rows] = await pool.execute(query, params);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ verified: false, message: 'No matching record off-chain.' });
    }
    const record = rows[0];

    // 2. Fetch on‑chain record
    const onChain = documentHash
      ? await transcriptContract.getByHash(record.document_hash)
      : await transcriptContract.getByMatric(record.matric_number);

    // 3. Compare matric & hash
    const match =
      onChain.matricNumber === record.matric_number &&
      onChain.documentHash === record.document_hash;

    if (!match) {
      return res.status(409).json({
        verified: false,
        message: 'On-chain data does not match off-chain record.',
      });
    }

    // 4. Parse metadata JSON
    let metadata;
    try {
      metadata = JSON.parse(record.metadata);
    } catch (_) {
      metadata = record.metadata;
    }

    // 5. Normalize timestamp
    const timestamp = onChain.timestamp;
    let uploadedAt;
    if (typeof timestamp === 'bigint') {
      uploadedAt = new Date(Number(timestamp) * 1000);
    } else if (timestamp.toNumber) {
      uploadedAt = new Date(timestamp.toNumber() * 1000);
    } else if (typeof timestamp === 'number') {
      uploadedAt = new Date(timestamp * 1000);
    } else {
      uploadedAt = 'Invalid timestamp';
    }

    // 6. Return enriched response, including fileUrl
    res.json({
      verified: true,
      transcript: {
        matricNumber:     record.matric_number,
        documentHash:     record.document_hash,
        metadata:         metadata,
        fileUrl:          record.file_url,        // ← new field
        uploadedOnChainAt: uploadedAt
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
