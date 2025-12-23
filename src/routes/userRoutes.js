const express = require('express');
const router = express.Router();
const { updatePhone } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/me/phone', protect, updatePhone);

module.exports = router;