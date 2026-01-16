import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogin() {
  const testEmail = 'iamchandanjainhp@gmail.com';
  const testPassword = 'TestPassword123';

  console.log('🔐 Testing login...\n');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!user) {
    console.log('❌ User not found in database');
    process.exit(1);
  }

  console.log('✅ User found');
  console.log(`Password hash: ${user.password || '(empty)'}`);
  console.log(`Is verified: ${user.isVerified}\n`);

  if (!user.password) {
    console.log('⚠️  User has no password! This is an OTP-only user.');
    console.log('\nTo fix this:');
    console.log('1. Delete this user and register with email/password');
    console.log('2. OR use OTP login instead');
    process.exit(1);
  }

  // Test password comparison
  try {
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Password match: ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);

    if (!isMatch) {
      console.log('\n💡 The password you entered does not match.');
      console.log('   The user was likely created with a different password.');
    }
  } catch (err) {
    console.error('❌ Error comparing passwords:', err.message);
  }

  process.exit(0);
}

testLogin().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
