const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPaymentLink,
  webhook,
  getPlans,
  getMySubscription,
} = require('../controllers/paymentController');

router.get('/plans', getPlans);
router.post('/webhook', webhook);

router.post('/create', protect, createPaymentLink);
router.get('/my-subscription', protect, getMySubscription);

module.exports = router;