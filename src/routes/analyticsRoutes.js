const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getBestSellers,
  getRevenue,
  getLowStock,
  getConversionRate
} = require('../controllers/analyticsController');

router.get('/dashboard', getDashboard);
router.get('/best-sellers', getBestSellers);
router.get('/revenue', getRevenue);
router.get('/low-stock', getLowStock);
router.get('/conversion-rate', getConversionRate);

module.exports = router;