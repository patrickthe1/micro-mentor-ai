import fetch from 'node-fetch';

const apiUrl = 'http://localhost:5000';

async function testApi() {
  try {
    console.log('Testing versioned API...');
    
    // Test version endpoint
    console.log('\n1. Testing /api/version endpoint');
    const versionResponse = await fetch(`${apiUrl}/api/version`);
    const versionData = await versionResponse.json();
    console.log('Version response:', JSON.stringify(versionData, null, 2));
    
    // Test categories endpoint
    console.log('\n2. Testing /api/categories endpoint');
    const categoriesResponse = await fetch(`${apiUrl}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('Categories response:', JSON.stringify(categoriesData, null, 2));
    
    // Test advice endpoint with valid request
    console.log('\n3. Testing /api/advice endpoint with valid request');
    const adviceResponse = await fetch(`${apiUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge: 'Difficulty managing my work-life balance',
        category: 'Work-Life Balance'
      }),
    });
    
    if (adviceResponse.ok) {
      const adviceData = await adviceResponse.json();
      console.log('Advice response structure:');
      console.log('- API Version:', adviceData.apiVersion);
      console.log('- Has data object:', !!adviceData.data);
      console.log('- Category:', adviceData.data.category);
      console.log('- Has insight:', !!adviceData.data.insight);
      console.log('- Steps count:', adviceData.data.steps.length);
    } else {
      console.error('Advice request failed:', await adviceResponse.text());
    }
    
    // Test invalid category
    console.log('\n4. Testing with invalid category');
    const invalidCategoryResponse = await fetch(`${apiUrl}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge: 'Difficulty managing my work-life balance',
        category: 'NonexistentCategory'
      }),
    });
    
    console.log('Invalid category status:', invalidCategoryResponse.status);
    console.log('Invalid category response:', await invalidCategoryResponse.json());
    
    // Test 404 error handling
    console.log('\n5. Testing 404 error handling');
    const notFoundResponse = await fetch(`${apiUrl}/api/nonexistent`);
    console.log('Not found status:', notFoundResponse.status);
    console.log('Not found response:', await notFoundResponse.json());
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApi(); 