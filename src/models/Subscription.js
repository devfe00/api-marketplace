const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['starter', 'growth', 'pro'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'pending', 'expired'],
    default: 'pending',
  },
  mercadoPagoId: {
    type: String, // ID da assinatura no MP
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  paymentHistory: [{
    date: Date,
    amount: Number,
    status: String,
    mercadoPagoPaymentId: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);