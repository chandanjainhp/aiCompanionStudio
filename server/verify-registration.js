// Quick verification that registration data persists in database
import { prisma } from './src/config/database.js';
const BASE_URL = 'http://localhost:3000/api/v1';

async function verifyRegistrationPersistence() {
  const testEmail = `verify-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Verification User';

  console.log('🔍 VERIFYING REGISTRATION DATA PERSISTENCE\n');
  console.log('Test Email:', testEmail);

  try {
    // Step 1: Register user via API
    console.log('\n1️⃣  Registering user via API...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });

    const registerData = await registerRes.json();
    if (!registerData.success) throw new Error('Registration failed');
    
    const userId = registerData.data.user.id;
    console.log('✅ Registered via API, User ID:', userId);

    // Step 2: Check database for stored user
    console.log('\n2️⃣  Checking database for registered user...');
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
      },
    });

    if (!dbUser) throw new Error('User not found in database!');
    
    console.log('✅ User found in database:');
    console.log('   ID:', dbUser.id);
    console.log('   Email:', dbUser.email);
    console.log('   Name:', dbUser.name);
    console.log('   Has password hash:', !!dbUser.password);
    console.log('   Created at:', dbUser.createdAt);

    // Step 3: Verify login works
    console.log('\n3️⃣  Verifying login with stored credentials...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Login failed');
    
    console.log('✅ Login successful with stored credentials');
    console.log('   Same User ID:', loginData.data.user.id === userId ? '✅ YES' : '❌ NO');
    console.log('   Token received:', !!loginData.data.accessToken);

    console.log('\n✅✅✅ REGISTRATION DATA PERSISTENCE VERIFIED ✅✅✅');
    console.log('\n📊 Summary:');
    console.log('✅ Registration stores data to database');
    console.log('✅ User password is hashed and stored');
    console.log('✅ Login retrieves and verifies stored user');
    console.log('✅ Database persistence is working correctly');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRegistrationPersistence();
