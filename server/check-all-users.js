import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('👥 All Users in Database:\n');

    const users = await prisma.user.findMany({
      include: {
        projects: true,
      },
    });

    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Verified: ${user.isVerified}`);
      console.log(`  Projects: ${user.projects.length}`);
      user.projects.forEach((p) => {
        console.log(`    - ${p.name} (${p.id})`);
      });
      console.log('');
    });

    console.log(`✅ Total users: ${users.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
