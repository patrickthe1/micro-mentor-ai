import { generateAdvice } from './geminiAPI.js';

/**
 * Simple test to verify that the migration to Gemini 2.0 works correctly
 */
async function testGemini2Integration() {
  console.log('Testing integration with Gemini 2.0...');
  
  try {
    const challenge = "I'm struggling to prioritize tasks effectively at work";
    console.log(`Testing challenge: "${challenge}"`);
    
    console.log('Generating advice using Gemini 2.0 Flash...');
    const response = await generateAdvice(challenge);
    
    console.log('Response received successfully!');
    console.log('Category:', response.category);
    console.log('Insight:', response.insight);
    console.log(`Number of steps: ${response.steps.length}`);
    
    // Print the first step as a sample
    console.log('\nSample step:');
    console.log('Title:', response.steps[0].title);
    console.log('Description:', response.steps[0].description);
    console.log('Difficulty:', response.steps[0].difficulty);
    console.log('Time commitment:', response.steps[0].time_commitment);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

// Run the test
testGemini2Integration(); 