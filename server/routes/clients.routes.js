const express = require('express');
const router = express.Router();
const { getAll, getBySlug } = require('../controllers/clients.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAll);
router.get('/:slug', authenticateToken, getBySlug);

module.exports = router;
