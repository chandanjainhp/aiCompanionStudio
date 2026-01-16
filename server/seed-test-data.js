import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...\n');

    // Create test user
    const email = 'test@example.com';
    const password = 'Test123!@';
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Test User',
        password: hashedPassword,
        isVerified: true,
        chatLimit: 10,
        chatUsageCount: 0,
      },
    });
    console.log(`✅ User created: ${user.email}`);

    // Create test project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'My First Project',
        description: 'A test project to get started',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: 'You are a helpful AI assistant.',
        isActive: true,
      },
    });
    console.log(`✅ Project created: ${project.name}`);
    console.log(`   Project ID: ${project.id}`);

    // Create test conversation
    const conversation = await prisma.conversation.create({
      data: {
        projectId: project.id,
        userId: user.id,
        title: 'Getting Started',
      },
    });
    console.log(`✅ Conversation created: ${conversation.title}`);
    console.log(`   Conversation ID: ${conversation.id}`);

    // Create a test message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: 'Hello! How can you help me?',
        tokensUsed: 10,
        model: 'gemini-2.0-flash',
      },
    });
    console.log(`✅ Message created`);

    console.log('\n📋 Credentials to login:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    console.log('\n🔗 Project link:');
    console.log(`   http://localhost:5173/chat/${project.id}`);

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
