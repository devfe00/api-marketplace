const analyticsService = require('../services/analyticsService');

exports.getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    //usa os últimos 30 dias
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      salesByPeriod,
      bestSellers,
      revenueByCategory,
      lowStock,
      conversionRate
    ] = await Promise.all([
      analyticsService.getTotalSalesByPeriod(start, end),
      analyticsService.getBestSellers(5),
      analyticsService.getRevenueByCategory(),
      analyticsService.getLowStockProducts(10),
      analyticsService.getConversionRate()
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        sales: salesByPeriod,
        bestSellers,
        revenue: revenueByCategory,
        lowStock: {
          count: lowStock.length,
          products: lowStock
        },
        conversionRate: conversionRate.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bestSellers = await analyticsService.getBestSellers(limit);

    res.status(200).json({
      success: true,
      count: bestSellers.length,
      data: bestSellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const revenue = await analyticsService.getRevenueByCategory();

    res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await analyticsService.getLowStockProducts(threshold);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//taxa conversão
exports.getConversionRate = async (req, res) => {
  try {
    const stats = await analyticsService.getConversionRate();

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};