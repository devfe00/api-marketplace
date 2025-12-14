require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testWhatsApp() {
  try {
    console.log('🚀 Testando Twilio...');
    console.log('📱 De:', process.env.TWILIO_WHATSAPP_NUMBER);
    console.log('📱 Para:', process.env.WHATSAPP_TO_NUMBER);
    
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.WHATSAPP_TO_NUMBER,
      body: '🧪 TESTE - Se você recebeu isso, o Twilio está funcionando!'
    });
    
    console.log('✅ Mensagem enviada!');
    console.log('📧 SID:', message.sid);
    console.log('📊 Status:', message.status);
  } catch (error) {
    console.log('❌ ERRO:', error.message);
    console.log('❌ Código:', error.code);
    console.log('❌ Detalhes:', error);
  }
}

testWhatsApp();