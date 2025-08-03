import connectDB from './db.js';
import { generateToken, requireAuth } from './auth.js';
import User from './models/User.js';
import SEOContent from './models/SEOContent.js';
import fetch from 'node-fetch';

// Gemini API configuration
const GEMINI_API_URL = process.env.GEMINI_API_URL || 
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Helper function to send JSON response
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Helper function to parse JSON body
const parseJsonBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
  });
};

// API Handlers
export const apiHandlers = {
  // Login endpoint
  async login(req, res) {
    try {
      await connectDB();
      const body = await parseJsonBody(req);
      const { username, password } = body;
      
      const user = await User.findOne({ username });
      
      if (user && user.password === password) {
        const token = generateToken({ 
          userId: user._id, 
          username: user.username 
        });
        
        sendJson(res, 200, { 
          success: true, 
          message: 'Login successful',
          token 
        });
      } else {
        sendJson(res, 401, { 
          success: false, 
          error: 'Invalid credentials' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      sendJson(res, 500, { 
        success: false, 
        error: 'Server error' 
      });
    }
  },

  // Logout endpoint (client-side token discard)
  async logout(req, res) {
    sendJson(res, 200, { 
      success: true, 
      message: 'Logged out successfully' 
    });
  },

  // Get SEO content (protected)
  async getSeoContent(req, res) {
    try {
      await requireAuth(req, res, async () => {
        await connectDB();
        const seoContents = await SEOContent.find().sort({ createdAt: -1 });
        sendJson(res, 200, { success: true, data: seoContents });
      });
    } catch (error) {
      console.error("Error fetching SEO content:", error);
      sendJson(res, 500, { success: false, error: "Failed to fetch SEO content" });
    }
  },

  // Delete SEO content (protected)
  async deleteSeoContent(req, res) {
    try {
      await requireAuth(req, res, async () => {
        await connectDB();
        const id = req.params?.id || req.url.split('/').pop();
        const result = await SEOContent.findByIdAndDelete(id);
        
        if (result) {
          sendJson(res, 200, { success: true, message: "SEO content deleted successfully" });
        } else {
          sendJson(res, 404, { success: false, error: "SEO content not found" });
        }
      });
    } catch (error) {
      console.error("Error deleting SEO content:", error);
      sendJson(res, 500, { success: false, error: "Failed to delete SEO content" });
    }
  },

  // Change password (protected)
  async changePassword(req, res) {
    try {
      await requireAuth(req, res, async () => {
        await connectDB();
        const body = await parseJsonBody(req);
        const { currentPassword, newPassword } = body;
        
        if (newPassword.length < 6) {
          return sendJson(res, 400, { 
            success: false, 
            error: 'New password must be at least 6 characters long' 
          });
        }
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
          return sendJson(res, 404, { 
            success: false, 
            error: 'User not found' 
          });
        }
        
        if (user.password !== currentPassword) {
          return sendJson(res, 400, { 
            success: false, 
            error: 'Current password is incorrect' 
          });
        }
        
        user.password = newPassword;
        await user.save();
        
        console.log(`Password changed successfully for user: ${user.username}`);
        
        sendJson(res, 200, { 
          success: true, 
          message: 'Password changed successfully'
        });
      });
    } catch (error) {
      console.error('Change password error:', error);
      sendJson(res, 500, { 
        success: false, 
        error: 'Server error' 
      });
    }
  },

  // Generate SEO content (protected)
  async generate(req, res) {
    try {
      await requireAuth(req, res, async () => {
        if (!GEMINI_API_KEY) {
          return sendJson(res, 500, { error: "Gemini API key not configured" });
        }

        const body = await parseJsonBody(req);
        const prompt = body.prompt;
        
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
          return sendJson(res, response.status, { error: `Gemini API error: ${errorText}` });
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
          parsedContentToSave = { error: "Malformed content from Gemini API", raw: cleanedGeminiText };
        }

        // Ensure DB connection before saving
        await connectDB();
        
        // Save generated content to database
        const newSEOContent = new SEOContent({
          sessionId: req.user.userId, // Associate with user ID
          keyword: body.keyword,
          urls: body.urls,
          generatedContent: JSON.stringify(parsedContentToSave),
        });
        await newSEOContent.save();
        console.log("Generated content saved to DB:", newSEOContent);

        sendJson(res, 200, data);
      });
    } catch (error) {
      console.error("Error:", error);
      sendJson(res, 500, { error: "Failed to get response from Gemini API" });
    }
  },

  // Health check
  async health(req, res) {
    try {
      await connectDB();
      sendJson(res, 200, { 
        status: "ok", 
        message: "Server is running", 
        environment: process.env.NODE_ENV || 'development',
        database: "connected"
      });
    } catch (error) {
      sendJson(res, 500, { 
        status: "error", 
        message: "Database connection failed",
        environment: process.env.NODE_ENV || 'development',
        database: "disconnected",
        error: error.message
      });
    }
  }
}; 