import { generateAdvice } from './geminiAPI.js';

/**
 * Simple test function to validate the response schema
 */
async function testResponseSchema() {
  console.log('Testing response schema...');
  
  try {
    // Test case 1: General career advice
    const challenge1 = "I'm struggling to find a good work-life balance as a software developer.";
    console.log(`\nTesting challenge: "${challenge1}"`);
    
    const response1 = await generateAdvice(challenge1);
    console.log('Response structure:');
    console.log(JSON.stringify(response1, null, 2));
    
    // Test case 2: With specific category
    const challenge2 = "I need to improve my public speaking skills for presentations.";
    const category2 = "Skill Improvement";
    console.log(`\nTesting challenge: "${challenge2}" with category: "${category2}"`);
    
    const response2 = await generateAdvice(challenge2, category2);
    console.log('Response structure:');
    console.log(JSON.stringify(response2, null, 2));
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testResponseSchema(); 