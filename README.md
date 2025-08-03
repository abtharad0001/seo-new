# SEO Content Generator - Unified Setup

A unified React frontend and Node.js backend application for generating SEO content using Google's Gemini AI. This setup uses Vite for development (serving both frontend and API) and a single Node.js server for production.

## 🚀 Features

- **Unified Development**: Single `npm run dev` command starts everything
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Cached database connections
- **Gemini AI Integration**: Content generation with Google's Gemini API
- **Production Ready**: Single server deployment
- **Mobile Friendly**: Accessible from LAN IP addresses

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd seo-gen-app-new
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

## 🔧 Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/seo-generator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🚀 Development

### Start Development Server
```bash
npm run dev
```

This starts Vite on `http://localhost:5173` which serves:
- **React frontend** with hot reload
- **API routes** under `/api/*` via middleware
- **CORS headers** for cross-origin requests

### API Endpoints (Development)

All endpoints are available at `http://localhost:5173/api/*`:

- `POST /api/login` - Authenticate user, returns JWT token
- `POST /api/logout` - Logout (client-side token discard)
- `GET /api/seo-content` - Get saved SEO content (protected)
- `DELETE /api/seo-content/:id` - Delete content (protected)
- `POST /api/change-password` - Change password (protected)
- `POST /api/generate` - Generate SEO content (protected)
- `GET /api/health` - Health check

## 🏗️ Production

### Build and Start
```bash
npm run build
npm start
```

This creates a single Node.js server that:
- Serves static files from `dist/`
- Handles all API routes under `/api/*`
- Supports SPA routing (serves `index.html` for all non-API routes)
- Listens on `0.0.0.0` for LAN access

## 🔐 Authentication

### JWT Token Usage

1. **Login to get token:**
   ```bash
   curl -X POST http://localhost:5173/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

2. **Use token for protected routes:**
   ```bash
   curl -X GET http://localhost:5173/api/seo-content \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Frontend Integration

```javascript
// Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();

// Use token for protected requests
const protectedResponse = await fetch('/api/seo-content', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📱 Mobile Testing

### Access from Mobile Devices

1. **Find your LAN IP:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Access from mobile:**
   - Development: `http://YOUR_LAN_IP:5173`
   - Production: `http://YOUR_LAN_IP:3000`

### Example LAN Access
- Development: `http://192.168.1.100:5173`
- Production: `http://192.168.1.100:3000`

## 🔧 API Testing

### Testing Protected Routes

1. **Get JWT token:**
   ```bash
   curl -X POST http://localhost:5173/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

2. **Test protected endpoints:**
   ```bash
   # Health check
   curl http://localhost:5173/api/health
   
   # Get SEO content (with token)
   curl -X GET http://localhost:5173/api/seo-content \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Generate content
   curl -X POST http://localhost:5173/api/generate \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Generate SEO content for FiveM MLO", "keyword": "fivem mlo", "urls": ["example.com"]}'
   ```

## 📁 Project Structure

```
seo-gen-app-new/
├── lib/                    # Shared utilities
│   ├── db.js              # MongoDB connection with caching
│   ├── auth.js            # JWT authentication utilities
│   ├── api.js             # API handlers (used by both dev/prod)
│   ├── models/            # MongoDB models
│   │   ├── User.js        # User model
│   │   └── SEOContent.js  # SEO content model
│   └── init-db.js         # Database initialization
├── src/                    # React frontend
├── vite.config.js         # Vite config with API middleware
├── server.js              # Production Node.js server
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## 🚀 Deployment

### Local Production Testing
```bash
npm run build
npm start
```

### Cloud Deployment
1. Set environment variables in your deployment platform
2. Deploy the entire project
3. The single `server.js` handles everything

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Protected Routes**: All sensitive endpoints require authentication
- **Environment Variables**: Secure configuration management
- **CORS Headers**: Proper cross-origin handling
- **Input Validation**: Server-side validation for all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection:**
   - Check `MONGODB_URI` in `.env`
   - Ensure MongoDB is running
   - Test connection: `curl http://localhost:5173/api/health`

2. **JWT Issues:**
   - Verify `JWT_SECRET` is set in `.env`
   - Check token format: `Bearer <token>`
   - Test login endpoint first

3. **API Not Working:**
   - Ensure development server is running: `npm run dev`
   - Check console for errors
   - Verify endpoint URLs

4. **Mobile Access:**
   - Check firewall settings
   - Verify LAN IP is correct
   - Test from browser first

## 📝 Available Scripts

- `npm run dev` - Start development server (Vite + API)
- `npm run build` - Build React app for production
- `npm start` - Start production server
- `npm run init-db` - Initialize database with admin user
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔄 Development Workflow

1. **Start development:** `npm run dev`
2. **Edit frontend:** Files in `src/` (hot reload)
3. **Edit API:** Files in `lib/api.js` (auto-restart)
4. **Test endpoints:** Use curl or browser
5. **Build for production:** `npm run build && npm start`

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Test database connection: `/api/health`
4. Check JWT token format and expiration
5. Verify API endpoints are accessible

---

**Note**: This setup provides a unified development experience with a single command to start everything, while maintaining a clean separation between development and production environments. 
