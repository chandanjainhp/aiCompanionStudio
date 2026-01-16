import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkUserProject() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { projects: true, conversations: true },
    });

    console.log('👤 User:', {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      isVerified: user?.isVerified,
    });

    console.log('\n📁 User Projects:', user?.projects);
    
    if (user?.projects?.length > 0) {
      const project = user.projects[0];
      console.log('\n🎯 First Project:', {
        id: project.id,
        name: project.name,
        userId: project.userId,
        match: project.userId === user?.id,
      });

      const conversations = await prisma.conversation.findMany({
        where: { projectId: project.id },
      });
      
      console.log('\n💬 Conversations for this project:', conversations.map(c => ({
        id: c.id,
        title: c.title,
        projectId: c.projectId,
      })));
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUserProject();
