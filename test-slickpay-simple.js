// Test simple pour vérifier l'erreur SlickPay
const { Invoice } = require('@slick-pay-algeria/slickpay-npm');

console.log('🧪 Test du package SlickPay...\n');

try {
  console.log('1. Vérification du package SlickPay...');
  console.log('   Package importé:', typeof Invoice);
  
  console.log('\n2. Test de création d\'instance...');
  const testKey = 'test_key_123';
  const slickPayInvoice = new Invoice(testKey, true);
  console.log('   Instance créée:', typeof slickPayInvoice);
  
  console.log('\n3. Test des méthodes disponibles...');
  console.log('   Méthodes:', Object.getOwnPropertyNames(Object.getPrototypeOf(slickPayInvoice)));
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error('Stack:', error.stack);
}