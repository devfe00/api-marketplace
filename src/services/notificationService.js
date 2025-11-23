const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

exports.checkLowStock = async () => {
  const lowStockProducts = await Product.find({
    stock: { $lte: 10 },
    status: 'active'
  });

  const notifications = [];

  for (const product of lowStockProducts) {
    const existingNotification = await Notification.findOne({
      productId: product._id,
      type: 'low_stock',
      read: false
    });

    if (!existingNotification) {
      let priority = 'medium';
      if (product.stock === 0) priority = 'critical';
      else if (product.stock <= 3) priority = 'high';

      const notification = await Notification.create({
        type: 'low_stock',
        priority,
        productId: product._id,
        title: `⚠️ Estoque baixo: ${product.name}`,
        message: `O produto ${product.name} (${product.sku}) está com apenas ${product.stock} unidade(s) em estoque.`,
        data: {
          currentStock: product.stock,
          sku: product.sku,
          category: product.category
        }
      });

      notifications.push(notification);
    }
  }

  return notifications;
};

exports.checkHotProducts = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentSales = await Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo }
      }
    },
    {
      $group: {
        _id: '$productId',
        totalQuantity: { $sum: '$quantity' },
        salesCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalValue' }
      }
    },
    {
      $match: {
        totalQuantity: { $gte: 5 } 
      }
    }
  ]);

  const notifications = [];

  for (const sale of recentSales) {
    const product = await Product.findById(sale._id);
    
    if (product) {
      const existingNotification = await Notification.findOne({
        productId: product._id,
        type: 'hot_product',
        read: false,
        createdAt: { $gte: oneDayAgo }
      });

      if (!existingNotification) {
        const notification = await Notification.create({
          type: 'hot_product',
          priority: 'high',
          productId: product._id,
          title: `🔥 Produto em alta: ${product.name}`,
          message: `${product.name} vendeu ${sale.totalQuantity} unidades nas últimas 24h! Faturamento: R$ ${sale.totalRevenue.toFixed(2)}`,
          data: {
            salesLast24h: sale.totalQuantity,
            revenueLast24h: sale.totalRevenue,
            salesCount: sale.salesCount,
            currentStock: product.stock
          }
        });

        notifications.push(notification);
      }
    }
  }

  return notifications;
};

//sugerir reposição baseado em histórico
exports.checkRestockSuggestions = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const salesHistory = await Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: '$productId',
        totalQuantity: { $sum: '$quantity' },
        avgDailySales: { $avg: '$quantity' }
      }
    }
  ]);

  const notifications = [];

  for (const history of salesHistory) {
    const product = await Product.findById(history._id);
    
    if (product && product.status === 'active') {
      const avgDailySales = history.totalQuantity / 7;
      const daysRemaining = product.stock / avgDailySales;

      if (daysRemaining < 5 && daysRemaining > 0) {
        const existingNotification = await Notification.findOne({
          productId: product._id,
          type: 'restock_suggestion',
          read: false,
          createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } 
        });

        if (!existingNotification) {
          const suggestedQuantity = Math.ceil(avgDailySales * 30); 
          const notification = await Notification.create({
            type: 'restock_suggestion',
            priority: daysRemaining < 2 ? 'high' : 'medium',
            productId: product._id,
            title: `📊 Sugestão de reposição: ${product.name}`,
            message: `Com base nas vendas dos últimos 7 dias, ${product.name} tem estoque para apenas ${Math.floor(daysRemaining)} dias. Sugestão: repor ${suggestedQuantity} unidades.`,
            data: {
              currentStock: product.stock,
              avgDailySales: avgDailySales.toFixed(2),
              daysRemaining: daysRemaining.toFixed(1),
              suggestedQuantity,
              salesLast7Days: history.totalQuantity
            }
          });

          notifications.push(notification);
        }
      }
    }
  }

  return notifications;
};

exports.checkNoSales = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const products = await Product.find({ status: 'active' });
  const notifications = [];

  for (const product of products) {
    const recentSales = await Sale.findOne({
      productId: product._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (!recentSales) {
      const existingNotification = await Notification.findOne({
        productId: product._id,
        type: 'no_sales',
        read: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (!existingNotification) {
        const notification = await Notification.create({
          type: 'no_sales',
          priority: 'low',
          productId: product._id,
          title: `⏸️ Sem vendas: ${product.name}`,
          message: `${product.name} não teve vendas nos últimos 30 dias. Considere revisar preço, descrição ou estoque.`,
          data: {
            currentStock: product.stock,
            price: product.price,
            category: product.category
          }
        });

        notifications.push(notification);
      }
    }
  }

  return notifications;
};

exports.runAllChecks = async () => {
  const [lowStock, hotProducts, restockSuggestions, noSales] = await Promise.all([
    this.checkLowStock(),
    this.checkHotProducts(),
    this.checkRestockSuggestions(),
    this.checkNoSales()
  ]);

  return {
    lowStock,
    hotProducts,
    restockSuggestions,
    noSales,
    total: lowStock.length + hotProducts.length + restockSuggestions.length + noSales.length
  };
};