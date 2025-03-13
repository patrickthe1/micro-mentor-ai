/**
 * API service for the Micro-Mentor AI application
 * Handles all communication with the backend
 * Will be fully implemented in Task 3
 */

// Base API URL - in a production app, this would come from environment variables
const API_URL = 'https://micro-mentor-ai.onrender.com';

/**
 * Function to get advice from the Micro-Mentor AI backend
 * @param {string} challenge - The user's challenge text
 * @returns {Promise<Object>} - The advice response
 * @throws {Error} - If the API call fails
 */
export const getAdvice = async (challenge) => {
  try {
    // Make the API call to the advice endpoint
    const response = await fetch(`${API_URL}/api/advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challenge }),
    });

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      // If not, throw an error with the status
      throw new Error(`API error: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching advice:', error);
    // Re-throw the error so it can be handled by the component
    throw error;
  }
}; 