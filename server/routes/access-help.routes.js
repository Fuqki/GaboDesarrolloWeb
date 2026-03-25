const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { createRequest, listRequests, resolveRequest } = require('../controllers/accessHelp.controller');

router.post('/', createRequest);

router.get('/', authenticateToken, requireAdmin, listRequests);
router.patch('/:id/resolve', authenticateToken, requireAdmin, resolveRequest);

module.exports = router;
