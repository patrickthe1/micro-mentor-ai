import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getCoachingAdvice(userInput) {
  try {
    const result = await model.generateContent(userInput);
    return result.response.text(); // Extracts AI response
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Sorry, I couldn't generate advice at the moment.";
  }
}
