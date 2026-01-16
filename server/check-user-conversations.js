import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkUserConversations() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'backupid849@gmail.com' },
      include: {
        conversations: {
          include: {
            project: true,
          },
        },
      },
    });

    console.log(`\n👤 User: ${user?.email}`);
    console.log(`📁 Projects: ${user?.projects?.length || 0}`);
    console.log(`💬 Conversations: ${user?.conversations?.length || 0}`);
    
    if (user?.conversations && user.conversations.length > 0) {
      user.conversations.forEach((conv) => {
        console.log(`   - ${conv.title} (ID: ${conv.id})`);
        console.log(`     Project: ${conv.project?.name}`);
      });
    } else {
      console.log('   ⚠️  No conversations found. Create one through the UI first!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUserConversations();
