const http = require('http');

// Test simple de l'API SlickPay
const testSlickPayAPI = () => {
  const postData = JSON.stringify({
    invoiceId: 'test-invoice-123',
    amount: 5000,
    description: 'Test de paiement SlickPay'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/payments/slickpay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Response is not valid JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

console.log('🧪 Test de l\'API SlickPay...');
testSlickPayAPI();