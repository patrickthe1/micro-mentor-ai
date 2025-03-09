import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to make request with retry logic
async function makeRequest(prompt) {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            lastError = error;
            
            if (attempt < MAX_RETRIES && error.status === 503) {
                await delay(RETRY_DELAY);
                continue;
            }
            
            throw new Error(getUserFriendlyErrorMessage(error));
        }
    }
    
    throw lastError;
}

// Function to get user-friendly error messages
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

export async function generateAdvice(challenge) {
    const prompt = `As a life coach, provide a concise, practical piece of advice (max 280 characters) for someone facing this challenge: "${challenge}". Focus on actionable steps and positive encouragement.`;
    
    try {
        const advice = await makeRequest(prompt);
        return advice;
    } catch (error) {
        throw error;
    }
}

