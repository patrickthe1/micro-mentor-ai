import fetch from 'node-fetch';

const apiUrl = 'http://localhost:5000';

async function testCaching() {
  try {
    console.log('Testing caching functionality...');
    
    // Test 1: First request (should be cache miss)
    console.log('\n1. Making initial request (cache miss expected)');
    const challenge = 'How can I improve my public speaking skills?';
    const category = 'Skill Improvement';
    
    console.time('First request');
    const firstResponse = await fetch(`${apiUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge,
        category
      }),
    });
    
    const firstData = await firstResponse.json();
    console.timeEnd('First request');
    
    console.log('Response time from metadata:', firstData.meta.responseTime);
    console.log('Has data:', !!firstData.data);
    
    // Test 2: Second request with same parameters (should be cache hit)
    console.log('\n2. Making second request with same parameters (cache hit expected)');
    
    console.time('Second request');
    const secondResponse = await fetch(`${apiUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge,
        category
      }),
    });
    
    const secondData = await secondResponse.json();
    console.timeEnd('Second request');
    
    console.log('Response time from metadata:', secondData.meta.responseTime);
    console.log('Has data:', !!secondData.data);
    
    // Test 3: Request with different parameters (should be cache miss)
    console.log('\n3. Making request with different parameters (cache miss expected)');
    
    console.time('Different parameters');
    const differentResponse = await fetch(`${apiUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge: 'How can I become a better leader?',
        category: 'Leadership'
      }),
    });
    
    const differentData = await differentResponse.json();
    console.timeEnd('Different parameters');
    
    console.log('Response time from metadata:', differentData.meta.responseTime);
    console.log('Has data:', !!differentData.data);
    
    // Test 4: Testing cache management
    if (process.env.ADMIN_API_KEY) {
      console.log('\n4. Testing cache management API');
      
      const cacheResponse = await fetch(`${apiUrl}/api/admin/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cleanup',
          apiKey: process.env.ADMIN_API_KEY
        }),
      });
      
      const cacheData = await cacheResponse.json();
      console.log('Cache cleanup response:', cacheData);
    } else {
      console.log('\n4. Skipping cache management test (ADMIN_API_KEY not set)');
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCaching(); 