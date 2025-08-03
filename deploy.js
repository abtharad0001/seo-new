#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting deployment process...\n');

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('⚠️  Setting NODE_ENV=production for deployment');
  process.env.NODE_ENV = 'production';
}

try {
  // Clean previous build
  const distPath = join(__dirname, 'dist');
  if (existsSync(distPath)) {
    console.log('🧹 Cleaning previous build...');
    rmSync(distPath, { recursive: true, force: true });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });

  // Build the React app
  console.log('🔨 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build
  if (!existsSync(distPath)) {
    throw new Error('Build failed: dist/ directory not found');
  }

  console.log('✅ Build completed successfully!');
  console.log('🎯 Starting production server...');
  console.log('📱 Your app will be available at http://localhost:3000');
  console.log('🔗 API endpoints available at http://localhost:3000/api/*\n');

  // Start the production server
  execSync('npm start', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 