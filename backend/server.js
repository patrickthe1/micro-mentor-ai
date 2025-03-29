import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { generateAdvice, cleanupCache } from "./geminiAPI.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Current API version
const API_VERSION = "1.0";

// Simple in-memory user store (replace with a real database in production)
const users = [];

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      apiVersion: API_VERSION,
      error: "Unauthorized. Authentication token required."
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'micro-mentor-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        apiVersion: API_VERSION,
        error: "Forbidden. Invalid or expired token."
      });
    }
    
    req.user = user;
    next();
  });
};

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
    const { challenge, category, customizations } = req.body;
    
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
    const advice = await generateAdvice(challenge, category, customizations);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log response time for monitoring
    console.log(`Response time: ${responseTime}ms for challenge: "${challenge.substring(0, 30)}..."`);
    
    // Add versioning to the response
    const responseVersion = req.body.version || API_VERSION;
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
      { path: "/health", method: "GET", description: "Health check endpoint" },
      { path: "/api/signup", method: "POST", description: "Create a new user account" },
      { path: "/api/login", method: "POST", description: "Authenticate a user" },
      { path: "/api/profile", method: "GET", description: "Get authenticated user profile" }
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

// Authentication Endpoints
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        apiVersion: API_VERSION,
        error: "Email and password are required."
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        apiVersion: API_VERSION,
        error: "User with this email already exists."
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'micro-mentor-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user data (excluding password) and token
    res.status(201).json({
      apiVersion: API_VERSION,
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email
        }
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      apiVersion: API_VERSION,
      error: "Server error during signup process."
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        apiVersion: API_VERSION,
        error: "Email and password are required."
      });
    }
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({
        apiVersion: API_VERSION,
        error: "Invalid credentials."
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        apiVersion: API_VERSION,
        error: "Invalid credentials."
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'micro-mentor-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.json({
      apiVersion: API_VERSION,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      apiVersion: API_VERSION,
      error: "Server error during login process."
    });
  }
});

app.get("/api/profile", authenticateToken, (req, res) => {
  try {
    const user = users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        apiVersion: API_VERSION,
        error: "User not found."
      });
    }
    
    // Return user data (excluding password)
    res.json({
      apiVersion: API_VERSION,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      apiVersion: API_VERSION,
      error: "Server error while fetching profile."
    });
  }
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
