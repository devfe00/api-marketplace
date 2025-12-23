const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

//notificação -estoque
exports.sendLowStockAlert = async (product) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.WHATSAPP_TO_NUMBER,
      body: `⚠️ *ESTOQUE BAIXO*\n\nProduto: ${product.name}\nSKU: ${product.sku}\nEstoque atual: ${product.stock} unidades\n\nReponha o estoque!`,
    });
    console.log(`✅ WhatsApp enviado: Estoque baixo - ${product.name}`);
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
  }
};

//notificação de venda
exports.sendSaleNotification = async (sale, product) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.WHATSAPP_TO_NUMBER,
      body: `🎉 *NOVA VENDA!*\n\nProduto: ${product.name}\nQuantidade: ${sale.quantity}\nValor: R$ ${sale.totalValue.toFixed(2)}\nEstoque restante: ${product.stock}`,
    });
    console.log(`✅ WhatsApp enviado: Venda - ${product.name}`);
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
  }
};

//resumo diário
exports.sendDailySummary = async (stats) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.WHATSAPP_TO_NUMBER,
      body: `📊 *RESUMO DO DIA*\n\nVendas: ${stats.totalSales}\nFaturamento: R$ ${stats.revenue.toFixed(2)}\nProdutos vendidos: ${stats.products}\n\nContinue assim! 💪`,
    });
    console.log(`✅ WhatsApp enviado: Resumo diário`);
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
  }
};

exports.sendCustomerConfirmation = async (sale, product, customerPhone) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${customerPhone}`, // ← Número do cliente
      body: `✅ *COMPRA CONFIRMADA!*\n\nProduto: ${product.name}\nQuantidade: ${sale.quantity}\nValor: R$ ${sale.totalValue.toFixed(2)}\n\nObrigado pela compra! 🎉`,
    });
    console.log(`✅ WhatsApp enviado para cliente: ${customerPhone}`);
  } catch (error) {
    console.error('Erro ao enviar WhatsApp para cliente:', error);
  }
};

exports.sendPasswordResetCode = async (phone, code) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: `🔐 *RECUPERAÇÃO DE SENHA*\n\nSeu código de verificação é: ${code}\n\nO código expira em 10 minutos.\n\nSe você não solicitou isso, ignore esta mensagem.`,
    });
    console.log(`✅ Código de recuperação enviado: ${phone}`);
  } catch (error) {
    console.error('Erro ao enviar código:', error);
  }
};