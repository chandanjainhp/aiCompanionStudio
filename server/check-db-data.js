import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database data...\n');

    // Check Users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isVerified: true, createdAt: true },
    });
    console.log(`👥 Users: ${users.length}`);
    users.forEach((u) => console.log(`   - ${u.email} (${u.isVerified ? 'verified' : 'unverified'})`));

    // Check Projects
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, userId: true, createdAt: true },
    });
    console.log(`\n📁 Projects: ${projects.length}`);
    projects.forEach((p) => console.log(`   - ${p.name} (User: ${p.userId})`));

    // Check Conversations
    const conversations = await prisma.conversation.findMany({
      select: { id: true, title: true, projectId: true, userId: true, createdAt: true },
    });
    console.log(`\n💬 Conversations: ${conversations.length}`);
    conversations.forEach((c) => console.log(`   - ${c.title} (Project: ${c.projectId})`));

    // Check Messages
    const messages = await prisma.message.findMany({
      select: { id: true, role: true, content: true, conversationId: true, createdAt: true },
      take: 5,
    });
    console.log(`\n💭 Messages (first 5): ${messages.length}`);
    messages.forEach((m) => console.log(`   - [${m.role}] ${m.content.substring(0, 50)}...`));

    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
