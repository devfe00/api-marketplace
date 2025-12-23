const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const bcrypt = require('bcryptjs');

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Email ou telefone é obrigatório'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        success: false,
        error: 'Este usuário não possui telefone cadastrado'
      });
    }

    const code = generateCode();
    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    await whatsappService.sendPasswordResetCode(user.phone, code);

    res.status(200).json({
      success: true,
      message: 'Código enviado para seu WhatsApp'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Código e nova senha são obrigatórios'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido ou expirado'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};