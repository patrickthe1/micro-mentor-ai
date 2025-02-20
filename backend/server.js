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
    const { challenge } = req.body;
    
    if (!challenge || challenge.trim().length === 0) {
      return res.status(400).json({ 
        error: "Please provide a challenge to get advice for." 
      });
    }

    const advice = await generateAdvice(challenge);
    res.json({ advice });
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error processing request:', error.message);
    }
    
    // Handle specific API errors
    if (error.message.includes("AI service is temporarily busy")) {
      return res.status(503).json({
        error: "Our AI advisor is currently busy. Please try again in a moment."
      });
    }

    // Handle other errors
    res.status(500).json({ 
      error: "An unexpected error occurred while processing your request. Please try again." 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
