/**
 * Helper functions for the Micro-Mentor AI application
 */

/**
 * Format date for display
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Save data to localStorage
 * @param {string} key - The key to use for storing the data
 * @param {any} data - The data to store
 */
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get data from localStorage
 * @param {string} key - The key to retrieve data for
 * @param {any} defaultValue - The default value to return if no data is found
 * @returns {any} - The retrieved data or the default value
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return defaultValue;
  }
}; 