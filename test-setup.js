#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 Testing development setup...\n');

async function testEndpoints() {
  try {
    // Test Express server directly
    console.log('1. Testing Express server (port 3000)...');
    const expressResponse = await fetch('http://localhost:3000/api/health');
    const expressData = await expressResponse.json();
    console.log('✅ Express server:', expressData);

    // Test Vite server with proxy
    console.log('\n2. Testing Vite server with proxy (port 5173)...');
    const viteResponse = await fetch('http://localhost:5173/api/health');
    const viteData = await viteResponse.json();
    console.log('✅ Vite proxy:', viteData);

    // Test if both are the same (proxy working)
    if (JSON.stringify(expressData) === JSON.stringify(viteData)) {
      console.log('\n🎉 SUCCESS: Both servers are running and proxy is working!');
      console.log('\n📱 Your development setup is ready:');
      console.log('   • Frontend: http://localhost:5173');
      console.log('   • Backend API: http://localhost:3000/api/*');
      console.log('   • Proxied API: http://localhost:5173/api/*');
    } else {
      console.log('\n❌ ERROR: Proxy not working correctly');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Make sure both servers are running: npm run dev');
    console.log('   • Check if ports 3000 and 5173 are available');
    console.log('   • Verify your .env file is configured');
  }
}

testEndpoints(); 