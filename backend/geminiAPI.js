import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getCoachingAdvice(userInput) {
  try {
    const prompt = `
      Provide a concise and direct response (no more than 1000 characters) to the following challenge:
      "${userInput}"
      
      Keep it practical, clear, and straight to the point.
    `;

    const result = await model.generateContent(prompt);
    let advice = result.response.text();

    // Ensure the response is under 1000 characters
    if (advice.length > 1000) {
      advice = advice.slice(0, 997) + "..."; // Trim and add ellipsis
    }

    return advice;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Sorry, I couldn't generate advice at the moment.";
  }
}

