const BASE_URL = 'http://localhost:3000/api/v1';

async function testLoginFlow() {
  try {
    console.log('🔐 Testing login...\n');

    // Test with the seeded user
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!@',
      }),
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success && data.data?.accessToken) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.data.accessToken.substring(0, 50) + '...');
      console.log('User:', data.data.user);

      // Now test accessing the project
      const projectId = 'cmkh2pa0f00022m2dielsw6lm';
      console.log(`\n📁 Testing project access with projectId: ${projectId}`);

      const projectResponse = await fetch(`${BASE_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${data.data.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const projectData = await projectResponse.json();
      console.log('Project response status:', projectResponse.status);
      console.log('Project data:', JSON.stringify(projectData, null, 2));
    } else {
      console.log('\n❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoginFlow();
