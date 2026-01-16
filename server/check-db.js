import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      isVerified: true,
      createdAt: true,
    },
  });

  console.log(`📊 Total users: ${users.length}\n`);

  if (users.length === 0) {
    console.log('⚠️  No users found in database!');
    process.exit(1);
  }

  users.forEach((user, idx) => {
    console.log(`User ${idx + 1}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Verified: ${user.isVerified}`);
    console.log(`  Password Hash: ${user.password.substring(0, 30)}...`);
    console.log(`  Created: ${user.createdAt}`);
    console.log();
  });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, userId: true },
  });

  console.log(`\n📂 Total projects: ${projects.length}`);
  projects.forEach((proj, idx) => {
    console.log(`  ${idx + 1}. ${proj.name} (User: ${proj.userId})`);
  });

  const conversations = await prisma.conversation.findMany({
    select: { id: true, title: true, projectId: true, userId: true },
  });

  console.log(`\n💬 Total conversations: ${conversations.length}`);
  conversations.forEach((conv, idx) => {
    console.log(`  ${idx + 1}. ${conv.title || '(untitled)'} (Project: ${conv.projectId})`);
  });

  console.log('\n✅ Database check complete!');
  process.exit(0);
}

checkDatabase().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
