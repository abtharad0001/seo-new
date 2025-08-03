# Vercel Deployment Guide

This guide will help you deploy your SEO Generator app to Vercel with proper database connectivity and authentication.

## 🚀 Prerequisites

1. **MongoDB Atlas Account** (recommended for production)
2. **Google Gemini API Key**
3. **Vercel Account**

## 📋 Step-by-Step Deployment

### 1. Prepare Your MongoDB Database

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP to the whitelist (or use `0.0.0.0/0` for all IPs)

#### Option B: Local MongoDB
- Not recommended for Vercel deployment as it won't be accessible

### 2. Set Up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seo-generator?retryWrites=true&w=majority

# API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Server Configuration
NODE_ENV=production
```

### 3. Initialize Database

Before deploying, you need to create the initial admin user. You can do this by:

1. **Local Setup** (recommended):
   ```bash
   # Set up your .env file locally
   cp env.template .env
   # Edit .env with your MongoDB URI and API keys
   
   # Initialize the database
   npm run init-db
   ```

2. **Or use MongoDB Compass** to manually create a user:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

### 4. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically deploy on pushes to main branch

### 5. Verify Deployment

1. **Check Health Endpoint**: Visit `https://your-app.vercel.app/api/health`
2. **Test Login**: Try logging in with admin/admin123
3. **Test API**: Try generating some SEO content

## 🔧 Troubleshooting

### Database Connection Issues

**Problem**: Database not connecting on Vercel
**Solutions**:
1. Check your `MONGODB_URI` in Vercel environment variables
2. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Verify database user has correct permissions
4. Check Vercel function logs for connection errors

### Authentication Issues

**Problem**: Login not working
**Solutions**:
1. Ensure database is initialized with admin user
2. Check session management (in-memory sessions may not persist)
3. Verify API routes are working

### API Key Issues

**Problem**: Gemini API not working
**Solutions**:
1. Verify `VITE_GEMINI_API_KEY` is set in Vercel
2. Check API key permissions and quotas
3. Test API key locally first

## 🛠️ Advanced Configuration

### Custom Domain
1. Go to Vercel project settings
2. Add your custom domain
3. Update DNS records as instructed

### Environment-Specific Variables
You can set different variables for different environments:
- **Production**: Set in Vercel dashboard
- **Preview**: Set in Vercel dashboard
- **Development**: Use local `.env` file

### Database Optimization
For better performance on Vercel:
1. Use MongoDB Atlas with proper indexing
2. Consider using connection pooling
3. Implement proper error handling

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your project
- Monitor function execution times
- Track API usage

### Database Monitoring
- Use MongoDB Atlas monitoring
- Set up alerts for connection issues
- Monitor query performance

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **API Keys**: Rotate keys regularly
3. **Database**: Use strong passwords and proper access controls
4. **Sessions**: Consider using Redis or database sessions for production

## 🚀 Production Checklist

- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set in Vercel
- [ ] Database initialized with admin user
- [ ] API keys configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled
- [ ] Monitoring set up
- [ ] Error handling implemented
- [ ] Performance optimized

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connection locally
4. Check MongoDB Atlas status
5. Review API key permissions

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Vercel will automatically redeploy
3. Or use `vercel --prod` to deploy manually

---

**Note**: This setup uses in-memory sessions which may not persist across function invocations. For production, consider using Redis or database-based sessions. 