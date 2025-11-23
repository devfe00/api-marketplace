const express = require('express');
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSalesByProduct,
  getSalesByPeriod
} = require('../controllers/salesController');

// Rotas
router.post('/', createSale);
router.get('/', getAllSales);
router.get('/product/:productId', getSalesByProduct);
router.get('/period', getSalesByPeriod);

module.exports = router;