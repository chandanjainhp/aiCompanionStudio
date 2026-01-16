import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkLatestProjects() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'backupid849@gmail.com' },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            conversations: true,
          },
        },
      },
    });

    console.log(`\n👤 User: ${user?.email}`);
    console.log(`\n📁 Projects (${user?.projects?.length || 0}):`);
    
    user?.projects?.forEach((project) => {
      console.log(`\n  ✅ ${project.name}`);
      console.log(`     ID: ${project.id}`);
      console.log(`     Created: ${project.createdAt}`);
      console.log(`     Conversations: ${project.conversations?.length || 0}`);
      
      project.conversations?.forEach((conv) => {
        console.log(`       - ${conv.title} (${conv.id})`);
      });
    });

    console.log('\n✅ Ready to chat!');
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestProjects();
