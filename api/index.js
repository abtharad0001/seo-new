import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import connectDB from "../server/config/database.js";
import User from "../server/models/User.js";
import SEOContent from "../server/models/SEOContent.js";

// Load environment variables
dotenv.config();

const app = express();

// Add a general request logger
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Use environment variables for API configuration
const GEMINI_API_URL = process.env.GEMINI_API_URL || 
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// For Vercel, we need to use a different session management approach
// Using a simple in-memory store for demo (in production, use Redis or database)
const sessions = new Map();

// Authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // For Vercel, we might need to reconnect to DB on each request
    await connectDB();
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    // Ensure DB connection
    await connectDB();
    
    const { username, password } = req.body;
    
    // Find user in database
    const user = await User.findOne({ username });
    
    if (user && user.password === password) {
      const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessions.set(sessionId, { userId: user._id, username: user.username });
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        sessionId 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get("/api/seo-content", requireAuth, async (req, res) => {
  try {
    console.log("Executing /api/seo-content GET route handler.");
    await connectDB();
    const seoContents = await SEOContent.find().sort({ createdAt: -1 }); // Get latest first
    res.json({ success: true, data: seoContents });
  } catch (error) {
    console.error("Error fetching SEO content:", error);
    res.status(500).json({ success: false, error: "Failed to fetch SEO content" });
  }
});

// API to delete SEO content (protected)
app.delete("/api/seo-content/:id", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const result = await SEOContent.findByIdAndDelete(id);
    if (result) {
      res.json({ success: true, message: "SEO content deleted successfully" });
    } else {
      res.status(404).json({ success: false, error: "SEO content not found" });
    }
  } catch (error) {
    console.error("Error deleting SEO content:", error);
    res.status(500).json({ success: false, error: "Failed to delete SEO content" });
  }
});

// Change password endpoint (protected)
app.post("/api/change-password", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { currentPassword, newPassword } = req.body;
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be at least 6 characters long' 
      });
    }
    
    // Get the session ID to find the user
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    // Find user by session
    const user = await User.findById(session.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Validate current password
    if (user.password !== currentPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }
    
    // Update password in database
    user.password = newPassword;
    await user.save();
    
    console.log(`Password changed successfully for user: ${user.username}`);
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// API Routes (protected)
app.post("/api/generate", requireAuth, async (req, res) => {
  try {
    console.log("Received API request:", req.body);
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const prompt = req.body.prompt;
    console.log("Prompt sent to Gemini API:", prompt);
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API HTTP error! status: ${response.status}, text: ${errorText}`);
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    console.log("Raw Gemini API response data:", data);

    const rawGeminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";

    // Apply cleaning to the Gemini response before saving
    const cleanedGeminiText = rawGeminiText
      .replace(/^```(?:javascript|json)?\s*\n?/, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsedContentToSave = {};
    try {
      parsedContentToSave = JSON.parse(cleanedGeminiText);
    } catch (parseError) {
      console.error("Error parsing Gemini response to JSON before saving:", parseError);
      // Fallback in case Gemini returns malformed JSON
      parsedContentToSave = { error: "Malformed content from Gemini API", raw: cleanedGeminiText };
    }

    // Ensure DB connection before saving
    await connectDB();
    
    // Save generated content to database (stringifying the parsed object)
    const newSEOContent = new SEOContent({
      sessionId: req.headers.authorization?.replace('Bearer ', ''), // Associate with session (or user ID)
      keyword: req.body.keyword,
      urls: req.body.urls,
      generatedContent: JSON.stringify(parsedContentToSave),
    });
    await newSEOContent.save();
    console.log("Generated content saved to DB:", newSEOContent);

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get response from Gemini API" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await connectDB();
    res.json({ 
      status: "ok", 
      message: "Server is running", 
      environment: "production",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: "Database connection failed",
      environment: "production",
      database: "disconnected",
      error: error.message
    });
  }
});

// Export for Vercel
export default app; 