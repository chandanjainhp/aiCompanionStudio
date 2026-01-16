// Quick test of message sending with new error handling
const BASE_URL = 'http://localhost:3000/api/v1';

async function quickTest() {
  console.log('🎯 TESTING MESSAGE SENDING WITH FALLBACK HANDLER\n');
  
  try {
    // Step 1: Register
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Quick Test User',
        email: `quick-test-${Date.now()}@example.com`,
        password: 'Test123!@',
      }),
    });
    const regData = await regRes.json();
    const token = regData.data.accessToken;
    
    console.log('✅ User registered');

    // Step 2: Create project
    const projRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Quick Test Project' }),
    });
    const projData = await projRes.json();
    const projectId = projData.data.id;
    
    console.log('✅ Project created');

    // Step 3: Create conversation
    const convRes = await fetch(`${BASE_URL}/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Quick Test' }),
    });
    const convData = await convRes.json();
    const conversationId = convData.data.id;
    
    console.log('✅ Conversation created');

    // Step 4: Send message (this will hit rate limit or succeed)
    console.log('\n📨 Sending message (may trigger rate limit handling)...');
    const msgRes = await fetch(
      `${BASE_URL}/projects/${projectId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: 'Test message' }),
      }
    );

    const msgData = await msgRes.json();
    
    if (msgData.success) {
      console.log('✅ Message sent successfully!');
      console.log('\n📊 Response:');
      console.log('   User message:', msgData.data.userMessage.content);
      console.log('   Assistant response:', msgData.data.assistantMessage.content.substring(0, 100) + '...');
      console.log('\n✨ Even with rate limits, the system works gracefully!');
    } else {
      console.log('❌ Failed:', msgData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

quickTest();
