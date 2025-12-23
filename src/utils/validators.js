exports.validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  

  const phoneRegex = /^\+\d{10,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return {
      valid: false,
      message: 'Telefone deve estar no formato internacional: +5511999887766'
    };
  }
  
  if (!cleanPhone.startsWith('+55')) {
    return {
      valid: false,
      message: 'Telefone deve começar com +55 (código do Brasil)'
    };
  }
  
  return {
    valid: true,
    phone: cleanPhone
  };
};

exports.formatPhone = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};