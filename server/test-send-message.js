import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/v1';

async function testSendMessage() {
  try {
    // First get a token by logging in
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
      }),
    });

    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

    if (!loginData.data?.accessToken) {
      console.error('❌ No access token received');
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Got access token:', token.substring(0, 20) + '...');

    // Get projects
    console.log('\n2️⃣ Fetching projects...');
    const projectsRes = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const projectsData = await projectsRes.json();
    console.log('Projects response:', projectsData);

    if (!projectsData.projects || projectsData.projects.length === 0) {
      console.error('❌ No projects found');
      return;
    }

    const projectId = projectsData.projects[0].id;
    console.log('✅ Using project:', projectId);

    // Get conversations
    console.log('\n3️⃣ Fetching conversations...');
    const conversationsRes = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const conversationsData = await conversationsRes.json();
    console.log('Conversations response:', conversationsData);

    if (!conversationsData.data || conversationsData.data.length === 0) {
      // Create one
      console.log('\n4️⃣ Creating conversation...');
      const createConvRes = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'Test Conversation' }),
      });

      const newConvData = await createConvRes.json();
      console.log('Create conversation response:', newConvData);

      if (!newConvData.data?.id) {
        console.error('❌ Failed to create conversation');
        return;
      }

      var conversationId = newConvData.data.id;
    } else {
      var conversationId = conversationsData.data[0].id;
    }

    console.log('✅ Using conversation:', conversationId);

    // Send message
    console.log('\n5️⃣ Sending message...');
    const messageRes = await fetch(
      `${API_URL}/projects/${projectId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: 'Hello, this is a test message!' }),
      }
    );

    const messageData = await messageRes.json();
    console.log('Send message response status:', messageRes.status);
    console.log('Send message response:', JSON.stringify(messageData, null, 2));

    if (messageRes.ok && messageData.data) {
      console.log('✅ Message sent successfully!');
      console.log('User message:', messageData.data.userMessage);
      console.log('Assistant message:', messageData.data.assistantMessage);
    } else {
      console.error('❌ Failed to send message');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSendMessage();
