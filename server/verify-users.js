// Verify user in database
import { prisma } from './src/config/database.js';

async function verifyUsers() {
  console.log('📊 Verifying registered users in database...\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('Recent users in database:');
  console.log(JSON.stringify(users, null, 2));
  
  console.log('\nTotal users:', users.length);
  
  await prisma.$disconnect();
}

verifyUsers().catch(console.error);
