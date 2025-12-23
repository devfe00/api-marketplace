const User = require('../models/User');
const { validatePhone } = require('../utils/validators');

exports.updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Telefone é obrigatório'
      });
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.message
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone: phoneValidation.phone },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
