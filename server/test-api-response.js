import axios from 'axios';

// Test the API directly with a real auth token
const BASE_URL = 'http://localhost:3000/api/v1';

// YOU NEED TO GET A REAL TOKEN - check localStorage or login first
const testWithAuth = async (token) => {
  try {
    console.log('🧪 Testing chat API with token...\n');
    
    const response = await axios.post(
      `${BASE_URL}/projects/cmkh6n2ty0007vykg6f9f3lyy/conversations/cmkhe146b0007karzag4507eo/messages`,
      {
        content: 'Test message: What is 2+2?',
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response Status:', response.status);
    console.log('\n📄 Full Response:\n', JSON.stringify(response.data, null, 2));
    
    console.log('\n📊 Response Structure:');
    console.log('  - success:', response.data.success);
    console.log('  - data keys:', Object.keys(response.data.data || {}));
    console.log('  - userMessage:', response.data.data?.userMessage ? '✅ exists' : '❌ MISSING');
    console.log('  - assistantMessage:', response.data.data?.assistantMessage ? '✅ exists' : '❌ MISSING');
    
    if (response.data.data?.assistantMessage) {
      console.log('\n📝 Assistant Message Content:');
      console.log(response.data.data.assistantMessage.content.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Request failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
};

console.log('To run this test:');
console.log('1. node test-api-response.js "YOUR_AUTH_TOKEN"');
console.log('2. Replace YOUR_AUTH_TOKEN with a real token from your browser localStorage');
console.log('3. Or run from browser console: fetch(...).then(r => r.json()).then(d => console.log(d))');

const token = process.argv[2];
if (token) {
  testWithAuth(token);
} else {
  console.log('\n⚠️  No token provided. Please get your auth token from browser localStorage["accessToken"]');
}
