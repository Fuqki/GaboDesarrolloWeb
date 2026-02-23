const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { getAll, getById, create } = require('../controllers/revisions.controller');
const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'blueprints'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `plano-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);
    cb(null, extValid || mimeValid);
  }
});

router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, upload.single('plano_archivo'), create);

module.exports = router;
