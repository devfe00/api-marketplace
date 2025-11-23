const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.getTotalSalesByPeriod = async (startDate, endDate) => {
  const sales = await Sale.find({
    saleDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalValue = sales.reduce((acc, sale) => acc + sale.totalValue, 0);
  const totalQuantity = sales.reduce((acc, sale) => acc + sale.quantity, 0);

  return {
    totalSales: sales.length,
    totalValue,
    totalQuantity
  };
};
exports.getBestSellers = async (limit = 10) => {
  const bestSellers = await Sale.aggregate([
    {
      $group: {
        _id: '$productId',
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalValue' },
        salesCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        _id: 1,
        productName: '$product.name',
        sku: '$product.sku',
        category: '$product.category',
        totalQuantity: 1,
        totalRevenue: 1,
        salesCount: 1
      }
    }
  ]);

  return bestSellers;
};

// Faturamento total e por categoria
exports.getRevenueByCategory = async () => {
  const revenue = await Sale.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $group: {
        _id: '$product.category',
        totalRevenue: { $sum: '$totalValue' },
        totalSales: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);

  const totalRevenue = revenue.reduce((acc, cat) => acc + cat.totalRevenue, 0);

  return {
    totalRevenue,
    categories: revenue
  };
};

exports.getLowStockProducts = async (threshold = 10) => {
  const products = await Product.find({
    stock: { $lte: threshold },
    status: 'active'
  }).sort({ stock: 1 });

  return products;
};

//(views vs vendas)
exports.getConversionRate = async () => {
  const products = await Product.find();
  
  const stats = await Promise.all(
    products.map(async (product) => {
      const sales = await Sale.find({ productId: product._id });
      const totalSales = sales.reduce((acc, sale) => acc + sale.quantity, 0);
      
      const conversionRate = product.views > 0 
        ? ((totalSales / product.views) * 100).toFixed(2)
        : 0;

      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        views: product.views,
        totalSales,
        conversionRate: parseFloat(conversionRate)
      };
    })
  );

  return stats.sort((a, b) => b.conversionRate - a.conversionRate);
};