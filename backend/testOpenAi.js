import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const chat = model.startChat();
  const result = await chat.sendMessage("write a haiku about ai");
  
  console.log(result.response.text());
}

runChat();