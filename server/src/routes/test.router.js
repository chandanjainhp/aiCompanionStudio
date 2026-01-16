// src/routes/test.router.js
import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, getEmailTransporter } from '../config/email.js';
import { prisma } from '../config/database.js';
import { generateIntegrityReport } from '../utils/database-integrity.js';

const router = express.Router();

/**
 * GET /api/v1/test/health
 * Check if server is running and database is connected
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: '✅ Server is healthy',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Database connection failed',
      error: error.message,
    });
  }
}));

/**
 * GET /api/v1/test/db-integrity
 * Database integrity validation report
 */
router.get('/db-integrity', asyncHandler(async (req, res) => {
  const report = await generateIntegrityReport();

  res.status(200).json({
    success: true,
    message: 'Database integrity report',
    data: report,
  });
}));

/**
 * POST /api/v1/test/send-test-otp
 * Send a test OTP to provided email
 */
router.post('/send-test-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Generate a test OTP
  const testOTP = '123456';
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📧 TEST OTP SENDING');
  console.log('═══════════════════════════════════════════════');
  console.log(`📨 To: ${email}`);
  console.log(`🔐 OTP Code: ${testOTP}`);
  console.log(`⏰ Valid for: 15 minutes`);
  console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════\n');

  // Try to send email
  try {
    await sendEmail(
      email,
      '🔐 Your Test OTP - ChatForge',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 10px;">
          <h2 style="text-align: center; color: #333;">Test OTP Code</h2>
          <div style="background: white; padding: 20px; border-radius: 5px; text-align: center;">
            <p style="font-size: 14px; color: #666;">Your test OTP code is:</p>
            <p style="font-size: 48px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; margin: 20px 0;">${testOTP}</p>
            <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    );

    console.log(`✅ Email sent successfully to ${email}`);

    res.status(200).json({
      success: true,
      message: `✅ Test OTP sent to ${email}`,
      otp: testOTP,
      email: email,
      expiresIn: 900, // 15 minutes
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(`❌ Email sending failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
}));

/**
 * POST /api/v1/test/send-real-otp
 * Send a real OTP to an email (for testing registration flow)
 */
router.post('/send-real-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Generate real OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  console.log('\n═══════════════════════════════════════════════');
  console.log('📧 REAL OTP SENDING');
  console.log('═══════════════════════════════════════════════');
  console.log(`📨 To: ${email}`);
  console.log(`🔐 OTP Code: ${code}`);
  console.log(`⏰ Expires At: ${expiresAt.toISOString()}`);
  console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════\n');

  // Save OTP to database
  try {
    const otp = await prisma.oTP.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    console.log(`✅ OTP saved to database with ID: ${otp.id}`);

    res.status(200).json({
      success: true,
      message: `✅ Real OTP sent to ${email}`,
      otp: code,
      email: email,
      expiresIn: 900, // 15 minutes
      otpId: otp.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(`❌ OTP creation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create OTP',
      error: error.message,
    });
  }
}));

/**
 * GET /api/v1/test/check-otps
 * Check all OTPs in the database
 */
router.get('/check-otps', asyncHandler(async (req, res) => {
  try {
    const otps = await prisma.oTP.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log('🔍 CHECKING OTPs IN DATABASE');
    console.log('═══════════════════════════════════════════════');
    otps.forEach((otp, index) => {
      console.log(`\n${index + 1}. Email: ${otp.email}`);
      console.log(`   Code: ${otp.code}`);
      console.log(`   Used: ${otp.isUsed ? '✅' : '❌'}`);
      console.log(`   Attempts: ${otp.attempts}/3`);
      console.log(`   Expires: ${otp.expiresAt.toISOString()}`);
      console.log(`   Created: ${otp.createdAt.toISOString()}`);
    });
    console.log('\n═══════════════════════════════════════════════\n');

    res.status(200).json({
      success: true,
      message: `Found ${otps.length} recent OTPs`,
      otps: otps.map(otp => ({
        id: otp.id,
        email: otp.email,
        code: otp.code,
        isUsed: otp.isUsed,
        attempts: otp.attempts,
        expiresAt: otp.expiresAt,
        createdAt: otp.createdAt,
      })),
    });
  } catch (error) {
    console.log(`❌ Failed to fetch OTPs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch OTPs',
      error: error.message,
    });
  }
}));

/**
 * GET /api/v1/test/check-users
 * Check all users in the database
 */
router.get('/check-users', asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log('👥 CHECKING USERS IN DATABASE');
    console.log('═══════════════════════════════════════════════');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
    });
    console.log('\n═══════════════════════════════════════════════\n');

    res.status(200).json({
      success: true,
      message: `Found ${users.length} users`,
      users: users,
    });
  } catch (error) {
    console.log(`❌ Failed to fetch users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
}));

/**
 * POST /api/v1/test/verify-otp-test
 * Test OTP verification logic
 */
router.post('/verify-otp-test', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
    });
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('🔐 TESTING OTP VERIFICATION');
  console.log('═══════════════════════════════════════════════');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 OTP: ${otp}`);
  console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Find matching OTP
    const foundOTP = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!foundOTP) {
      console.log(`❌ OTP not found for ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check expiration
    if (new Date() > foundOTP.expiresAt) {
      console.log(`❌ OTP expired at ${foundOTP.expiresAt.toISOString()}`);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Check attempts
    if (foundOTP.attempts >= 3) {
      console.log(`❌ Max attempts (3) reached`);
      return res.status(400).json({
        success: false,
        message: 'Max verification attempts reached',
      });
    }

    console.log(`✅ OTP verification successful for ${email}`);
    console.log(`   OTP ID: ${foundOTP.id}`);
    console.log(`   Created: ${foundOTP.createdAt.toISOString()}`);
    console.log(`   Expires: ${foundOTP.expiresAt.toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'OTP verification successful',
      otp: foundOTP,
    });
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message,
    });
  }
}));

/**
 * GET /api/v1/test/logs
 * Display current system logs and status
 */
router.get('/logs', asyncHandler(async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Count items
    const userCount = await prisma.user.count();
    const otpCount = await prisma.oTP.count();
    const projectCount = await prisma.project.count();

    const logs = {
      success: true,
      message: '✅ System Status',
      status: {
        server: '✅ Running',
        database: '✅ Connected',
        email: '✅ Configured',
      },
      counts: {
        users: userCount,
        otps: otpCount,
        projects: projectCount,
      },
      config: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        DATABASE: process.env.DATABASE_URL?.split('@')[1] || 'hidden',
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_USER: process.env.EMAIL_USER,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 SYSTEM STATUS');
    console.log('═══════════════════════════════════════════════');
    console.log(JSON.stringify(logs, null, 2));
    console.log('═══════════════════════════════════════════════\n');

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message,
    });
  }
}));

export default router;
