const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validatePhone } = require('../utils/validators');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'seu-secret-super-seguro', {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

if (phone) {
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    return res.status(400).json({
      success: false,
      error: phoneValidation.message
    });
  }
}

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      plan: 'free',
      planLimits: {
        maxProducts: 10, 
      },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        planLimits: user.planLimits,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};