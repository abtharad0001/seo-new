#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import { apiHandlers } from './lib/api.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Helper function to get MIME type
const getMimeType = (filePath) => {
  const extname = path.extname(filePath).toLowerCase();
  return mimeTypes[extname] || 'application/octet-stream';
};

// Helper function to serve static files
const serveStaticFile = (res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
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

// API route handler
const handleApiRequest = async (req, res) => {
  try {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse URL to determine endpoint
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname.replace('/api', '');
    
    console.log(`API Request: ${req.method} ${path}`);

    // Route to appropriate handler
    switch (path) {
      case '/login':
        if (req.method === 'POST') {
          await apiHandlers.login(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      case '/logout':
        if (req.method === 'POST') {
          await apiHandlers.logout(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      case '/seo-content':
        if (req.method === 'GET') {
          await apiHandlers.getSeoContent(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      case '/change-password':
        if (req.method === 'POST') {
          await apiHandlers.changePassword(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      case '/generate':
        if (req.method === 'POST') {
          await apiHandlers.generate(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      case '/health':
        if (req.method === 'GET') {
          await apiHandlers.health(req, res);
        } else {
          res.writeHead(405);
          res.end('Method not allowed');
        }
        break;

      default:
        // Handle DELETE /api/seo-content/:id
        if (req.method === 'DELETE' && path.startsWith('/seo-content/')) {
          await apiHandlers.deleteSeoContent(req, res);
        } else {
          res.writeHead(404);
          res.end('API endpoint not found');
        }
        break;
    }
  } catch (error) {
    console.error('API handler error:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
};

// Main request handler
const requestHandler = async (req, res) => {
  try {
    // Handle API routes
    if (req.url.startsWith('/api')) {
      return await handleApiRequest(req, res);
    }

    // Handle static files
    let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // For SPA routing, serve index.html for all non-API routes
      filePath = path.join(__dirname, 'dist', 'index.html');
    }

    serveStaticFile(res, filePath);
  } catch (error) {
    console.error('Request handler error:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
};

// Create and start server
const server = http.createServer(requestHandler);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api/*`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📱 Access from LAN: http://0.0.0.0:${PORT}`);
}); 