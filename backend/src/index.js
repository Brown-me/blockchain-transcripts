// src/index.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const uploadRoute = require('./routes/upload');
const verifyRoute = require('./routes/verify');

const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json());

// Serve uploaded files from the `uploads/` directory.
// A request to GET /uploads/<filename> will return the file.
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Mount API routes
app.use('/api/upload', uploadRoute);
app.use('/api/verify', verifyRoute);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
