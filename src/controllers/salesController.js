const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Registrar venda
exports.createSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Buscar o produto
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar estoque
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Estoque insuficiente. Disponível: ${product.stock}`
      });
    }

    // Calcular valor total
    const totalValue = product.price * quantity;

    // Criar venda
    const sale = await Sale.create({
      productId,
      quantity,
      totalValue,
      saleDate: req.body.saleDate || Date.now()
    });

    // Atualizar estoque do produto
    product.stock -= quantity;
    await product.save();

    // Retornar venda com dados do produto
    const saleWithProduct = await Sale.findById(sale._id).populate('productId');

    res.status(201).json({
      success: true,
      data: saleWithProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Listar todas as vendas
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('productId');
    
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buscar vendas de um produto específico
exports.getSalesByProduct = async (req, res) => {
  try {
    const sales = await Sale.find({ productId: req.params.productId }).populate('productId');
    
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buscar vendas por período
exports.getSalesByPeriod = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros start e end são obrigatórios'
      });
    }

    const sales = await Sale.find({
      saleDate: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).populate('productId');

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};