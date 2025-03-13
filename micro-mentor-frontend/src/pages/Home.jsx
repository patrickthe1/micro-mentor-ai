import React, { useState } from 'react';
import ChallengeForm from '../components/ChallengeForm';
import LoadingSpinner from '../components/LoadingSpinner';
import AdviceDisplay from '../components/AdviceDisplay';
import { getAdvice } from '../services/api';

/**
 * Home page component for the Micro-Mentor AI application
 * Contains the main functionality and manages state between components
 */
function Home() {
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(false);
  
  // State for storing the advice received from the API
  const [advice, setAdvice] = useState('');
  
  // State for tracking errors
  const [error, setError] = useState('');

  /**
   * Handle form submission to get advice
   * @param {string} challenge - The user's challenge text
   */
  const handleGetAdvice = async (challenge) => {
    // Reset states
    setError('');
    setIsLoading(true);
    
    try {
      // Call the API service
      const response = await getAdvice(challenge);
      
      // Set the advice from the response
      setAdvice(response.advice);
    } catch (err) {
      // Handle errors
      setError('Sorry, we encountered an error getting your advice. Please try again.');
      console.error('Error in handleGetAdvice:', err);
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  /**
   * Handle retrying after an error
   */
  const handleRetry = () => {
    setError('');
  };

  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-8">Welcome to Micro-Mentor</h2>
      <p className="text-xl text-center text-gray-400 mb-8">
        What challenge can I help you with today?
      </p>
      
      {/* Error message display */}
      {error && (
        <div className="w-full max-w-2xl p-4 mb-6 bg-red-900/50 border border-red-700 rounded-lg text-white">
          <p className="mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white text-sm"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Challenge form */}
      <ChallengeForm onSubmit={handleGetAdvice} isLoading={isLoading} />
      
      {/* Loading spinner */}
      {isLoading && <LoadingSpinner />}
      
      {/* Advice display */}
      {!isLoading && advice && <AdviceDisplay advice={advice} />}
    </main>
  );
}

export default Home; 