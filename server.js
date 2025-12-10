const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://marketplace-dashboard-mocha.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

connectDB();

//teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🐍 Marketplace Manager API', 
    status: 'online',
    version: '1.0.0'
  });
});

app.use('/api/auth', require('./src/routes/authRoutes')); 
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/sales', require('./src/routes/salesRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 MONGODB_URI está definido: ${!!process.env.MONGODB_URI}`);
});