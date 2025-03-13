import fetch from 'node-fetch';

/**
 * Simple test to validate the API endpoint
 */
async function testApiEndpoint() {
  console.log('Testing API endpoint...');
  
  try {
    // Start the server in a separate process
    console.log('Note: Make sure the server is running (node server.js) in another terminal!');
    
    // Test case 1: General career advice
    const challenge1 = "I need advice on networking effectively at industry conferences";
    console.log(`\nTesting challenge: "${challenge1}"`);
    
    const response1 = await fetch('http://localhost:5000/api/advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challenge: challenge1 }),
    });
    
    const data1 = await response1.json();
    console.log('Response status:', response1.status);
    console.log('Response data:', JSON.stringify(data1, null, 2));
    
    // Test case 2: Categories endpoint
    console.log('\nTesting categories endpoint');
    
    const response2 = await fetch('http://localhost:5000/api/categories');
    const data2 = await response2.json();
    
    console.log('Response status:', response2.status);
    console.log('Available categories:', data2.categories);
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testApiEndpoint(); 