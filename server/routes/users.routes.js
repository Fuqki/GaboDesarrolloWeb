const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { listUsers, createUser, resetPassword } = require('../controllers/users.controller');

router.use(authenticateToken, requireAdmin);

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/password', resetPassword);

module.exports = router;
