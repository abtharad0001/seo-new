import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import { apiHandlers } from './lib/api.js'

// Load environment variables
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'api-middleware',
      configureServer(server) {
        // API middleware for development
        server.middlewares.use('/api', async (req, res, next) => {
          try {
            // Add CORS headers for development
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
            console.error('API middleware error:', error);
            res.writeHead(500);
            res.end('Internal server error');
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
