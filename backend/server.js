import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getCoachingAdvice } from "./geminiAPI.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/advice", async (req, res) => {
  console.log("Received request:", req.method, req.url, req.body);
  const { challenge } = req.body;
  if (!challenge) {
    return res.status(400).json({ error: "Challenge is required." });
  }

  const advice = await getCoachingAdvice(challenge);
  res.json({ advice });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
