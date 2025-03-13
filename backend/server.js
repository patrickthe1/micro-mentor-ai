import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateAdvice } from "./geminiAPI.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/advice", async (req, res) => {
  try {
    const { challenge, category } = req.body;
    
    if (!challenge || challenge.trim().length === 0) {
      return res.status(400).json({ 
        error: "Please provide a challenge to get advice for." 
      });
    }

    // Pass both challenge and optional category to generateAdvice
    const advice = await generateAdvice(challenge, category);
    
    // Return the structured response directly
    res.json(advice);
  } catch (error) {
    // Always log the full error in development
    console.error('API Error:', error.message);
    
    // Handle specific API errors
    if (error.message.includes("AI service is temporarily busy")) {
      return res.status(503).json({
        error: "Our AI advisor is currently busy. Please try again in a moment."
      });
    }

    // Handle other errors with more detail
    res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
});

// New endpoint to get available categories
app.get("/api/categories", (req, res) => {
  // These categories are aligned with the advice domain
  const categories = [
    "Career Development",
    "Skill Improvement",
    "Work-Life Balance",
    "Leadership",
    "Communication",
    "Networking",
    "Project Management",
    "Time Management",
    "Conflict Resolution",
    "Professional Relationships"
  ];
  
  res.json({ categories });
});

app.get("/", (req, res) => {
    res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
