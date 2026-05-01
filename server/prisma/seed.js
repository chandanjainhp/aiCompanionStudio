// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seed...');

  // Check existing users
  const userCount = await prisma.user.count();
  console.log(` Current user count: ${userCount}`);

  if (userCount > 0) {
    console.log(' Database already has users.');
    console.log('\n To set a password for existing OTP-only user:');
    console.log('   POST /api/v1/users/set-password');
    console.log('   Body: { "newPassword": "YourPassword123" }');
    console.log('   (Requires authentication with that user\'s token)\n');
    return;
  }

  // Create test user WITH password for testing login
  console.log('👤 Creating test user with password...');
  const hashedPassword = await bcrypt.hash('TestPassword123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      isVerified: true,
    },
  });

  console.log(' Test user created:', {
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Create test project
  console.log('📁 Creating test project...');
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Test Project',
      description: 'Test project for development',
      systemPrompt: 'You are a helpful AI assistant.',
    },
  });

  console.log(' Test project created:', {
    id: project.id,
    name: project.name,
    userId: project.userId,
  });

  // Create test conversation
  console.log('💬 Creating test conversation...');
  const conversation = await prisma.conversation.create({
    data: {
      projectId: project.id,
      userId: user.id,
      title: 'Test Conversation',
    },
  });

  console.log(' Test conversation created:', {
    id: conversation.id,
    title: conversation.title,
    projectId: conversation.projectId,
    userId: conversation.userId,
  });

  // Create test message
  console.log('Creating test message...');
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: 'Hello, this is a test message',
    },
  });

  console.log(' Test message created:', {
    id: message.id,
    role: message.role,
    content: message.content.substring(0, 50),
  });

  console.log('\n Database seed completed successfully!');
  console.log('\n Test Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: TestPassword123');
  console.log('\n📊 Seeded data:');
  console.log(`   Users: 1`);
  console.log(`   Projects: 1`);
  console.log(`   Conversations: 1`);
  console.log(`   Messages: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
