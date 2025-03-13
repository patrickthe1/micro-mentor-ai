import React from 'react';

/**
 * LoadingSpinner component
 * Displays an animated loading spinner when content is loading
 */
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-400">Getting your advice...</span>
    </div>
  );
}

export default LoadingSpinner; 