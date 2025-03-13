import React from 'react';

/**
 * AdviceDisplay component
 * Displays the advice received from the Micro-Mentor AI backend
 * 
 * @param {Object} props
 * @param {string} props.advice - The advice text to display
 */
function AdviceDisplay({ advice }) {
  // If no advice is provided, don't render anything
  if (!advice) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mt-8 bg-gray-900 rounded-lg p-6 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-blue-400">
        Here's your personalized advice:
      </h3>
      <div className="text-white whitespace-pre-line">
        {advice}
      </div>
    </div>
  );
}

export default AdviceDisplay; 