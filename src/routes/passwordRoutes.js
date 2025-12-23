const express = require('express');
const router = express.Router();
const { requestPasswordReset, resetPassword } = require('../controllers/passwordController');

router.post('/request-reset', requestPasswordReset);
router.post('/reset', resetPassword);

module.exports = router;