const express = require('express');
const router = express.Router();
const { getByRevisionId, create } = require('../controllers/inspections.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/revision/:revisionId', authenticateToken, getByRevisionId);
router.post('/revision/:revisionId', authenticateToken, create);

module.exports = router;
