const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
});

const PLANS = {
  starter: {
    name: 'Starter',
    price: 19.90,
    maxProducts: 50,
  },
  growth: {
    name: 'Growth',
    price: 39.90,
    maxProducts: 200,
  },
  pro: {
    name: 'Pro',
    price: 69.90,
    maxProducts: 999999,
  },
};

exports.createPaymentLink = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        error: 'Plano inválido. Escolha: starter, growth ou pro',
      });
    }

    const planData = PLANS[plan];

    const preference = new Preference(client);

const response = await preference.create({
  body: {
    items: [
      {
        title: `Plano ${planData.name} - Mamba Manager`,
        quantity: 1,
        unit_price: planData.price,
        currency_id: 'BRL',
      },
    ],
    payer: {
      email: req.user.email,
      name: req.user.name,
    },
    external_reference: `${userId}-${plan}`,
  },
});

    res.status(200).json({
      success: true,
      data: {
        paymentLink: response.init_point,
        preferenceId: response.id,
      },
    });
  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Webhook - Mercado Pago notifica quando pagamento é confirmado
exports.webhook = async (req, res) => {
  try {
    const payment = req.body;

    if (payment.type === 'payment' && payment.action === 'payment.created') {
      const paymentId = payment.data.id;

      const paymentClient = new Payment(client);
      const paymentData = await paymentClient.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const [userId, plan] = paymentData.external_reference.split('-');

        const user = await User.findById(userId);
        if (!user) {
          console.error('Usuário não encontrado:', userId);
          return res.status(404).send('User not found');
        }

        const planData = PLANS[plan];
        user.plan = plan;
        user.planLimits.maxProducts = planData.maxProducts;
        user.subscriptionStatus = 'active';
        user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        await Subscription.create({
          userId: user._id,
          plan,
          price: planData.price,
          status: 'active',
          mercadoPagoId: paymentData.id,
          expiresAt: user.subscriptionExpiresAt,
          paymentHistory: [
            {
              date: new Date(),
              amount: planData.price,
              status: 'approved',
              mercadoPagoPaymentId: paymentData.id,
            },
          ],
        });

        console.log(`✅ Pagamento aprovado! Usuário ${user.email} agora tem plano ${plan}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Webhook error');
  }
};

// Listar planos disponíveis
exports.getPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: Object.keys(PLANS).map(key => ({
        id: key,
        ...PLANS[key],
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id,
      status: 'active' 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscription || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};