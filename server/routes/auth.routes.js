const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticateToken, getProfile);

module.exports = router;
