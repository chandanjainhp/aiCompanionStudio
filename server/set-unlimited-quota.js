import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function setUnlimitedQuota() {
  try {
    console.log('🔧 Setting unlimited chat quota...\n');

    // Update test user to have unlimited quota
    const user = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: {
        chatLimit: 999999,
        chatUsageCount: 0,
      },
      select: {
        email: true,
        chatLimit: true,
        chatUsageCount: true,
      },
    });

    console.log('✅ User quota updated:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Chat Limit: ${user.chatLimit}`);
    console.log(`   Current Usage: ${user.chatUsageCount}`);
    console.log('\n✅ Unlimited chat quota enabled!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setUnlimitedQuota();
