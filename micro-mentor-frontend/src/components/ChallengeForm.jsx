import React, { useState } from 'react';

/**
 * ChallengeForm component for the Micro-Mentor AI application
 * Allows users to input their challenge and request advice
 * Will be fully implemented in Task 2
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {boolean} props.isLoading - Whether the form is in a loading state
 */
function ChallengeForm({ onSubmit, isLoading }) {
  // State to track the user's input
  const [challenge, setChallenge] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit if the challenge is empty or if we're already loading
    if (!challenge.trim() || isLoading) return;
    
    // Call the onSubmit callback with the challenge
    onSubmit(challenge);
  };

  return (
    <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
      <textarea 
        className="w-full bg-gray-900 rounded-lg p-4 text-white" 
        placeholder="Enter your challenge here..."
        rows="5"
        value={challenge}
        onChange={(e) => setChallenge(e.target.value)}
        disabled={isLoading}
      />
      <button 
        type="submit"
        className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                   flex items-center justify-center w-full md:w-auto transition-colors
                   ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        <span className="mr-2">💡</span> 
        {isLoading ? 'Getting Advice...' : 'Get Advice'}
      </button>
    </form>
  );
}

export default ChallengeForm; 