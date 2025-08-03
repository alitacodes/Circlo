const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBackend() {
  console.log('🧪 Testing backend server...');
  
  try {
    // Test health endpoint
    console.log('📡 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    
    // Test if server is running
    if (healthResponse.ok) {
      console.log('✅ Backend server is running and responding');
    } else {
      console.log('❌ Backend server responded with error');
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
    console.log('💡 Run: cd backend && node server.js');
  }
}

testBackend(); 