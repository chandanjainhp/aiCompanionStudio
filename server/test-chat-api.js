// Comprehensive Chat API Test - Phase 1
const BASE_URL = 'http://localhost:3000/api/v1';
let testUserId = '';
let testProjectId = '';
let testConversationId = '';
let accessToken = '';

async function testChatAPI() {
  console.log('🧪 COMPREHENSIVE CHAT API TEST\n');
  
  try {
    // Step 1: Register user
    console.log('📝 [STEP 1] Registering test user...');
    const testEmail = `chat-test-${Date.now()}@example.com`;
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        name: 'Chat Test User',
      }),
    });
    
    const registerData = await registerRes.json();
    if (!registerData.success) throw new Error(`Registration failed: ${registerData.error?.message}`);
    
    testUserId = registerData.data.user.id;
    accessToken = registerData.data.accessToken;
    console.log('✅ User registered:', testUserId);
    console.log();

    // Step 2: Create project
    console.log('🏗️  [STEP 2] Creating test project...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Chat Test Project',
        description: 'Project for testing chat API',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful assistant for testing.',
      }),
    });
    
    const projectData = await projectRes.json();
    if (!projectData.success) throw new Error(`Project creation failed: ${projectData.error?.message}`);
    
    testProjectId = projectData.data.id;
    console.log('✅ Project created:', testProjectId);
    console.log();

    // Step 3: Create conversation
    console.log('💬 [STEP 3] Creating conversation...');
    const convRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Test Conversation',
      }),
    });
    
    const convData = await convRes.json();
    if (!convData.success) throw new Error(`Conversation creation failed: ${convData.error?.message}`);
    
    testConversationId = convData.data.id;
    console.log('✅ Conversation created:', testConversationId);
    console.log('   Title:', convData.data.title);
    console.log('   Created at:', convData.data.createdAt);
    console.log();

    // Step 4: List conversations
    console.log('📋 [STEP 4] Listing all conversations...');
    const listRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const listData = await listRes.json();
    if (!listData.success) throw new Error(`List conversations failed: ${listData.error?.message}`);
    
    console.log(`✅ Found ${listData.data.conversations.length} conversation(s)`);
    listData.data.conversations.forEach((conv, i) => {
      console.log(`   [${i + 1}] ${conv.title} (${conv.messageCount} messages)`);
    });
    console.log();

    // Step 5: Get conversation details
    console.log('🔍 [STEP 5] Getting conversation details...');
    const detailRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations/${testConversationId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const detailData = await detailRes.json();
    if (!detailData.success) throw new Error(`Get conversation failed: ${detailData.error?.message}`);
    
    console.log('✅ Conversation details retrieved');
    console.log('   Title:', detailData.data.title);
    console.log('   Message count:', detailData.data.messages.length);
    console.log();

    // Step 6: Send a message
    console.log('📤 [STEP 6] Sending a message...');
    const msgRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations/${testConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content: 'Hello, can you help me with a test?',
        stream: false,
      }),
    });
    
    console.log('   Response status:', msgRes.status);
    const msgData = await msgRes.json();
    console.log('   Response body:', JSON.stringify(msgData, null, 2));
    if (!msgData.success) throw new Error(`Send message failed: ${msgData.error?.message || JSON.stringify(msgData)}`);
    
    console.log('✅ Message sent and response received');
    console.log('   User message:', msgData.data.userMessage.content);
    console.log('   Assistant response:', msgData.data.assistantMessage.content.substring(0, 100) + '...');
    console.log('   Tokens used:', msgData.data.assistantMessage.tokensUsed);
    console.log('   Quota used:', msgData.quota.used + '/' + msgData.quota.limit);
    console.log();

    // Step 7: Update conversation title
    console.log('✏️  [STEP 7] Updating conversation title...');
    const updateRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations/${testConversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Test Conversation',
      }),
    });
    
    const updateData = await updateRes.json();
    if (!updateData.success) throw new Error(`Update conversation failed: ${updateData.error?.message}`);
    
    console.log('✅ Title updated:', updateData.data.title);
    console.log();

    // Step 8: Delete conversation
    console.log('🗑️  [STEP 8] Deleting conversation...');
    const deleteRes = await fetch(`${BASE_URL}/projects/${testProjectId}/conversations/${testConversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error(`Delete conversation failed: ${deleteData.error?.message}`);
    
    console.log('✅ Conversation deleted');
    console.log('   Deleted at:', deleteData.data.deletedAt);
    console.log();

    console.log('✅✅✅ ALL TESTS PASSED! ✅✅✅\n');
    console.log('🎉 Chat API Phase 1 is working correctly!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testChatAPI();
