const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({ storage });

// Upload image (legacy single) - allowed for student, faculty
router.post('/image', auth(true), authorize(['student','faculty']), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

// New: upload multiple files (images, videos, pdfs) in one request
router.post('/files', auth(true), authorize(['student','faculty']), upload.array('files', 12), (req, res) => {
  const files = (req.files || []).map(f => ({
    url: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    originalname: f.originalname,
    size: f.size,
  }));
  if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
  res.status(201).json({ files });
});

module.exports = router;
