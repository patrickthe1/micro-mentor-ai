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
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.error('Error processing request:', error.message);
    }
    
    // More specific error handling
    if (!error.status) {
      res.status(500).json({ 
        error: "Server connection error. Please try again later." 
      });
    } else {
      res.status(error.status).json({ 
        error: error.message || "An unexpected error occurred. Please try again later." 
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
