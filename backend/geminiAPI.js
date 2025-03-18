import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const responseCache = new Map();

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes a request to the Gemini API with built-in retry logic
 * @param {string} prompt - The prompt to send to the API
 * @returns {Promise<string>} - The text response from the API
 * @throws {Error} - If the request fails after all retries
 */
async function makeRequest(prompt) {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Updated to use Gemini 2.0 Flash model as per Google's recommendation
            // Previous model "gemini-1.5-flash" will be discontinued on September 24, 2025
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            lastError = error;
            
            // Only retry on service unavailable errors
            if (attempt < MAX_RETRIES && error.status === 503) {
                await delay(RETRY_DELAY);
                continue;
            }
            
            throw new Error(getUserFriendlyErrorMessage(error));
        }
    }
    
    throw lastError;
}

/**
 * Converts API error codes to user-friendly error messages
 * @param {Error} error - The error object from the API
 * @returns {string} - A user-friendly error message
 */
function getUserFriendlyErrorMessage(error) {
    if (error.status === 503) {
        return "The AI service is temporarily busy. Please try again in a moment.";
    }
    if (error.status === 429) {
        return "We've reached our API limit. Please try again later.";
    }
    if (error.status === 401 || error.status === 403) {
        return "There's an issue with the API authentication. Please contact support.";
    }
    return "Something went wrong. Please try again later.";
}

/**
 * Validates that the response conforms to the expected schema
 * @param {Object} response - The JSON response object to validate
 * @returns {boolean} - Whether the response is valid
 */
function validateResponse(response) {
    // Check if response is an object
    if (!response || typeof response !== 'object') {
        return false;
    }
    
    // Check required top-level fields
    if (!('category' in response) || 
        !('insight' in response) || 
        !('confidence_score' in response) || 
        !('steps' in response)) {
        return false;
    }
    
    // Check steps array
    if (!Array.isArray(response.steps) || response.steps.length < 3 || response.steps.length > 5) {
        return false;
    }
    
    // Check each step for required fields
    for (const step of response.steps) {
        if (!step.title || !step.description || !step.difficulty || !step.time_commitment) {
            return false;
        }
        
        // Validate difficulty is one of the allowed values
        if (!['beginner', 'intermediate', 'advanced'].includes(step.difficulty)) {
            return false;
        }
    }
    
    // Check confidence score is a number between 0 and 1
    if (typeof response.confidence_score !== 'number' || 
        response.confidence_score < 0 || 
        response.confidence_score > 1) {
        return false;
    }
    
    return true;
}

/**
 * Attempts to safely parse JSON, returning null on failure
 * @param {string} jsonString - The string to parse as JSON
 * @returns {Object|null} - The parsed object or null if parsing fails
 */
function safeJsonParse(jsonString) {
    try {
        // Try to find JSON within the response if it's not a clean JSON string
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Creates a fallback response when the API response isn't valid
 * @param {string} challenge - The original challenge
 * @returns {Object} - A fallback response object
 */
function createFallbackResponse(challenge) {
    return {
        category: "General Advice",
        insight: `I understand you're facing challenges with "${challenge}". Let me provide some structured guidance.`,
        confidence_score: 0.7,
        steps: [
            {
                title: "Assess Your Current Situation",
                description: "Take time to reflect on the specific aspects of this challenge that are most difficult for you. Understanding the root causes will help you address them effectively.",
                difficulty: "beginner",
                time_commitment: "15-20 minutes"
            },
            {
                title: "Research Potential Solutions",
                description: "Look for resources, articles, or examples of how others have overcome similar challenges. This will give you multiple perspectives to consider.",
                difficulty: "beginner",
                time_commitment: "30-45 minutes"
            },
            {
                title: "Create an Action Plan",
                description: "Based on your assessment and research, outline specific, measurable steps you'll take to address the challenge. Setting clear goals increases your chances of success.",
                difficulty: "intermediate",
                time_commitment: "20-30 minutes"
            }
        ],
        overall_takeaway: "Remember that overcoming challenges takes time and persistence. Be patient with yourself through the process.",
        generation_timestamp: new Date().toISOString()
    };
}

/**
 * Creates a cache key from the challenge and category
 * @param {string} challenge - The challenge text
 * @param {string|null} category - The optional category
 * @returns {string} - A cache key
 */
function createCacheKey(challenge, category) {
    // Normalize challenge by removing extra spaces, converting to lowercase
    const normalizedChallenge = challenge.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Combine challenge and category (if present) for the cache key
    return `${normalizedChallenge}|${category || 'none'}`;
}

/**
 * Checks if a cache entry is still valid based on its timestamp
 * @param {Object} cacheEntry - The cache entry with timestamp
 * @returns {boolean} - Whether the cache entry is still valid
 */
function isCacheValid(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp) return false;
    
    const now = Date.now();
    return (now - cacheEntry.timestamp) < CACHE_TTL;
}

/**
 * Generates structured advice for a given challenge
 * @param {string} challenge - The challenge to generate advice for
 * @param {string} [category] - Optional category for the advice
 * @returns {Promise<Object>} - A structured advice object following the schema
 * @throws {Error} - If the request fails or response can't be properly formatted
 */
export async function generateAdvice(challenge, category = null) {
    // Check cache first
    const cacheKey = createCacheKey(challenge, category);
    
    // If we have a valid cached response, return it
    if (responseCache.has(cacheKey)) {
        const cachedResponse = responseCache.get(cacheKey);
        if (isCacheValid(cachedResponse)) {
            console.log(`Cache hit for: "${challenge.substring(0, 30)}..."`);
            return cachedResponse.data;
        } else {
            // Remove expired cache entry
            responseCache.delete(cacheKey);
        }
    }
    
    // Enhanced prompt that encourages structured responses
    const prompt = `
You are MicroMentor AI, a professional mentor for young professionals. Provide structured, actionable advice for someone facing this challenge:

"${challenge}"

Follow these guidelines:

1. Think step-by-step about the best advice for this specific challenge.
2. Determine the most appropriate category for this challenge.
3. Create a clear, concise insight (1-2 sentences) that captures the essence of your advice.
4. Develop 3-5 sequential, actionable steps that build upon each other and guide the user to overcome their challenge.
5. For each step, include a clear title, detailed description explaining the "why" behind it, appropriate difficulty level, and estimated time commitment.
6. Add optional fields where relevant (resources, potential challenges, success metrics).
7. Conclude with an overall takeaway that encourages the user.

Your response MUST be a valid JSON object with this exact structure:
{
  "category": "A relevant category like Career Development, Skill Improvement, etc.",
  "insight": "Your 1-2 sentence main insight that summarizes the advice.",
  "confidence_score": 0.XX, // A number between 0-1 indicating confidence in the advice
  "steps": [
    {
      "title": "Step 1 Title",
      "description": "Detailed description explaining what to do and why it matters.",
      "difficulty": "beginner", // Must be one of: beginner, intermediate, advanced
      "time_commitment": "XX-XX minutes/hours", // Estimated time to complete
      "resources": [
        { "title": "Resource Name", "url": "https://example.com" }
      ]
    },
    // Include 2-4 more steps with similar structure
  ],
  "overall_takeaway": "A concluding thought of encouragement.",
  "related_topics": ["topic1", "topic2"],
  "generation_timestamp": "${new Date().toISOString()}"
}

IMPORTANT: 
- Ensure each step builds upon previous steps
- Make sure all JSON is properly formatted with no trailing commas
- Use a professional, encouraging tone appropriate for mentorship
- Be specific and actionable rather than generic
${category ? `- Focus on the "${category}" category` : ''}
`;

    try {
        // Make the request to the Gemini API
        const responseText = await makeRequest(prompt);
        
        // Try to parse the response as JSON
        let responseJson = safeJsonParse(responseText);
        
        // If we couldn't parse the JSON or the response doesn't match our schema
        if (!responseJson || !validateResponse(responseJson)) {
            console.warn("Invalid response format received from API, using fallback response");
            responseJson = createFallbackResponse(challenge);
        }
        
        // Add a timestamp if it doesn't exist
        if (!responseJson.generation_timestamp) {
            responseJson.generation_timestamp = new Date().toISOString();
        }
        
        // Cache the valid response
        responseCache.set(cacheKey, {
            timestamp: Date.now(), // When it was cached
            data: responseJson     // The actual response data
        });
        
        // Log cache size for monitoring
        if (responseCache.size % 10 === 0) {
            console.log(`Cache size: ${responseCache.size} entries`);
        }
        
        return responseJson;
    } catch (error) {
        console.error("Error generating advice:", error);
        throw error;
    }
}

/**
 * Clears expired entries from the cache
 * This can be called periodically or on demand to maintain cache health
 * @returns {number} - Number of cache entries removed
 */
export function cleanupCache() {
    let removedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of responseCache.entries()) {
        if (now - entry.timestamp >= CACHE_TTL) {
            responseCache.delete(key);
            removedCount++;
        }
    }
    
    console.log(`Cache cleanup: removed ${removedCount} expired entries. Current size: ${responseCache.size}`);
    return removedCount;
}

// Set up a daily cache cleanup
setInterval(cleanupCache, 24 * 60 * 60 * 1000); // Run once daily

