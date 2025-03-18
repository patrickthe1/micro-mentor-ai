import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { generateAdvice, cleanupCache } from "./geminiAPI.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Current API version
const API_VERSION = "1.0";

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    apiVersion: API_VERSION,
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware to log all API requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.post("/api/advice", async (req, res) => {
  try {
    const { challenge, category, version } = req.body;
    
    if (!challenge || challenge.trim().length === 0) {
      return res.status(400).json({ 
        apiVersion: API_VERSION,
        error: "Please provide a challenge to get advice for." 
      });
    }

    // Validate the category if provided
    if (category) {
      const validCategories = [
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
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          apiVersion: API_VERSION,
          error: "Invalid category. Use /api/categories to see available options."
        });
      }
    }

    // Track response time for performance monitoring
    const startTime = Date.now();
    
    // Pass both challenge and optional category to generateAdvice
    const advice = await generateAdvice(challenge, category);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log response time for monitoring
    console.log(`Response time: ${responseTime}ms for challenge: "${challenge.substring(0, 30)}..."`);
    
    // Add versioning to the response
    const responseVersion = version || API_VERSION;
    const response = {
      apiVersion: responseVersion,
      data: advice,
      meta: {
        responseTime: `${responseTime}ms`
      }
    };
    
    // Return the structured response with version information
    res.json(response);
  } catch (error) {
    // Always log the full error in development
    console.error('API Error:', error.message);
    
    // Handle specific API errors
    if (error.message.includes("AI service is temporarily busy")) {
      return res.status(503).json({
        apiVersion: API_VERSION,
        error: "Our AI advisor is currently busy. Please try again in a moment."
      });
    }
    
    if (error.message.includes("API limit")) {
      return res.status(429).json({
        apiVersion: API_VERSION,
        error: "We've reached our API rate limit. Please try again later."
      });
    }

    // Handle other errors with more detail
    res.status(500).json({ 
      apiVersion: API_VERSION,
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
  
  res.json({ 
    apiVersion: API_VERSION,
    data: { categories } 
  });
});

// API version and info endpoint
app.get("/api/version", (req, res) => {
  res.json({
    apiVersion: API_VERSION,
    name: "Micro-Mentor AI API",
    description: "AI-powered mentorship advice API",
    endpoints: [
      { path: "/api/advice", method: "POST", description: "Get structured advice for a challenge" },
      { path: "/api/categories", method: "GET", description: "Get available advice categories" },
      { path: "/api/version", method: "GET", description: "Get API version information" },
      { path: "/api/admin/cache", method: "POST", description: "Admin endpoint to manage response cache" },
      { path: "/health", method: "GET", description: "Health check endpoint" }
    ]
  });
});

// Admin endpoint for cache management
app.post("/api/admin/cache", (req, res) => {
  const { action, apiKey } = req.body;
  
  // Simple API key validation
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      apiVersion: API_VERSION,
      error: "Unauthorized. Valid API key required for admin operations."
    });
  }
  
  if (action === "cleanup") {
    const removedCount = cleanupCache();
    return res.json({
      apiVersion: API_VERSION,
      data: {
        action: "cleanup",
        removedEntries: removedCount,
        message: "Cache cleanup completed successfully"
      }
    });
  }
  
  res.status(400).json({
    apiVersion: API_VERSION,
    error: "Invalid action. Supported actions: cleanup"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    apiVersion: API_VERSION,
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
    res.status(200).send("OK");
});

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).json({
    apiVersion: API_VERSION,
    error: "Not Found",
    message: `The requested endpoint ${req.path} does not exist`
  });
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    apiVersion: API_VERSION,
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Version: ${API_VERSION}`);
  console.log(`Available endpoints: /api/advice, /api/categories, /api/version, /health, /api/admin/cache`);
});
