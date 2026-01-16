import { config } from './src/config/env.js';

console.log('🔑 Current API Key in .env:');
console.log('   Key:', config.googleApiKey?.substring(0, 20) + '...');
console.log('   Length:', config.googleApiKey?.length);
console.log('   Starts with "AIza":', config.googleApiKey?.startsWith('AIza'));

// Test calling the API
const testAPI = async () => {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + config.googleApiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say hello' }] }],
      }),
    }
  );

  const data = await response.json();
  
  if (response.ok) {
    console.log('\n✅ API Key is VALID');
    console.log('✅ Response received:', data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50));
  } else {
    console.log('\n❌ API Key Status:', response.status);
    console.log('❌ Error:', data.error?.message);
  }
};

testAPI();
