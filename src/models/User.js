const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false,
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'growth', 'pro'],
    default: 'free',
  },
  planLimits: {
    maxProducts: {
      type: Number,
      default: 10, // Free: 10 produtos
    },
  },
  subscriptionId: {
    type: String, // ID do Mercado Pago
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'pending'],
    default: 'pending',
  },
  subscriptionExpiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Hash password antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);