const fetch = require('node-fetch')

async function testCartAPI() {
  try {
    console.log('=== TESTING CART API ===')
    
    // Test with userId
    console.log('\n1. Testing with userId:')
    const userResponse = await fetch('http://localhost:3000/api/cart?userId=cmgdgablm0000ur9c8ygsdm4u')
    const userData = await userResponse.json()
    console.log('Response:', JSON.stringify(userData, null, 2))
    
    // Test with sessionId
    console.log('\n2. Testing with sessionId:')
    const sessionResponse = await fetch('http://localhost:3000/api/cart?sessionId=y7cn36y73ot')
    const sessionData = await sessionResponse.json()
    console.log('Response:', JSON.stringify(sessionData, null, 2))
    
    // Test without parameters
    console.log('\n3. Testing without parameters:')
    const noParamsResponse = await fetch('http://localhost:3000/api/cart')
    const noParamsData = await noParamsResponse.json()
    console.log('Response:', JSON.stringify(noParamsData, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testCartAPI()