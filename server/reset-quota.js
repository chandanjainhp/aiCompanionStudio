import { prisma } from './src/config/database.js';

async function resetQuota() {
  try {
    console.log('🔄 Resetting quota for backupid849@gmail.com...\n');
    
    const user = await prisma.user.update({
      where: { email: 'backupid849@gmail.com' },
      data: {
        chatUsageCount: 0,
        chatLimit: 1000  // Set high limit for testing
      },
      select: {
        id: true,
        email: true,
        chatUsageCount: true,
        chatLimit: true
      }
    });
    
    console.log('✅ Quota reset successfully!');
    console.log('User:', user);
    console.log(`\n📊 New quotas:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Usage: ${user.chatUsageCount}/${user.chatLimit}`);
    console.log(`   Remaining: ${user.chatLimit - user.chatUsageCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting quota:', error.message);
    process.exit(1);
  }
}

resetQuota();
