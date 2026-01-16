import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/v1';

async function testMessageFlow() {
  try {
    const testEmail = `chat-test-${Date.now()}@example.com`;
    const testPassword = 'TestPass123!@';
    const testName = 'Chat Test User';

    console.log('🧪 TEST: COMPLETE MESSAGE FLOW\n');

    // 1️⃣ REGISTER
    console.log('1️⃣ Registering user...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    const registerData = await registerRes.json();
    console.log('   Status:', registerRes.status);
    if (!registerRes.ok) {
      console.error('   ❌ Registration failed:', registerData.message);
      return;
    }
    console.log('   ✅ Registered successfully');

    // 2️⃣ LOGIN
    console.log('\n2️⃣ Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status);
    if (!loginRes.ok) {
      console.error('   ❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data?.accessToken;
    if (!token) {
      console.error('   ❌ No token in response');
      return;
    }
    console.log('   ✅ Logged in, got token');

    // 3️⃣ CREATE PROJECT
    console.log('\n3️⃣ Creating project...');
    const projectRes = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Project for testing messages',
        model: 'gemini-2.0-flash',
      }),
    });

    const projectData = await projectRes.json();
    console.log('   Status:', projectRes.status);
    if (!projectRes.ok) {
      console.error('   ❌ Project creation failed:', projectData.message);
      return;
    }

    const projectId = projectData.data?.id;
    if (!projectId) {
      console.error('   ❌ No project ID in response');
      return;
    }
    console.log('   ✅ Project created:', projectId);

    // 4️⃣ CREATE CONVERSATION
    console.log('\n4️⃣ Creating conversation...');
    const convRes = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Test Conversation' }),
    });

    const convData = await convRes.json();
    console.log('   Status:', convRes.status);
    console.log('   Response:', JSON.stringify(convData, null, 2));
    
    if (!convRes.ok) {
      console.error('   ❌ Conversation creation failed:', convData.message);
      return;
    }

    const conversationId = convData.data?.id;
    if (!conversationId) {
      console.error('   ❌ No conversation ID in response');
      return;
    }
    console.log('   ✅ Conversation created:', conversationId);

    // 5️⃣ SEND MESSAGE
    console.log('\n5️⃣ Sending message...');
    const messageRes = await fetch(
      `${API_URL}/projects/${projectId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: 'Hello! This is a test message.' }),
      }
    );

    const messageData = await messageRes.json();
    console.log('   Status:', messageRes.status);
    console.log('   Response structure:', {
      success: messageData.success,
      hasData: !!messageData.data,
      dataKeys: messageData.data ? Object.keys(messageData.data) : [],
      hasUserMessage: !!messageData.data?.userMessage,
      hasAssistantMessage: !!messageData.data?.assistantMessage,
    });
    
    if (!messageRes.ok) {
      console.error('   ❌ Send message failed:', messageData.message);
      console.error('   Full response:', JSON.stringify(messageData, null, 2));
      return;
    }

    if (messageData.data?.userMessage && messageData.data?.assistantMessage) {
      console.log('   ✅ Message sent successfully!');
      console.log('   User message:', messageData.data.userMessage.content);
      console.log('   Assistant message:', messageData.data.assistantMessage.content);
    } else {
      console.error('   ❌ Response missing messages:');
      console.error('   ', JSON.stringify(messageData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testMessageFlow();
