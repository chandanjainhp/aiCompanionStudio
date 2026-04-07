// src/services/otp.service.js
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { sendEmail } from '../config/email.js';
import { config } from '../config/env.js';
import { VERIFICATION_EMAIL_TEMPLATE } from '../../email/emailTemplates.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 15;

/**
 * Generate a random OTP code
 */
const generateOTPCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP to user email
 * CRITICAL: This function ONLY sends OTP - it does NOT create users
 */
export const sendOTP = async (email, name = '') => {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      throw new BadRequestError('Valid email is required');
    }

    // Generate OTP code
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing unused OTPs for this email
    await prisma.oTP.deleteMany({
      where: {
        email,
        isUsed: false,
      },
    });

    // Create new OTP record (NO user creation here)
    const otp = await prisma.oTP.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email with OTP
    const emailContent = VERIFICATION_EMAIL_TEMPLATE.replace(
      '{verificationCode}',
      code
    );

    console.log(`📧 [otp.service.sendOTP] Sending OTP to ${email}`);
    console.log(`🔐 [otp.service.sendOTP] OTP Code: ${code}`);
    console.log(`⏰ [otp.service.sendOTP] Expires in: ${OTP_EXPIRY_MINUTES} minutes`);

    await sendEmail(email, 'Your Login OTP - TMS', emailContent);

    console.log(`✅ [otp.service.sendOTP] OTP sent successfully to ${email}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      otpId: otp.id,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    };
  } catch (error) {
    console.error('❌ [otp.service.sendOTP] Error:', error);
    throw error;
  }
};

/**
 * Verify OTP code
 * CRITICAL: This function ONLY verifies OTP - it does NOT create users
 * User creation happens in auth.service.loginWithOTP
 */
export const verifyOTP = async (email, code) => {
  try {
    // Validate input
    if (!email || !code) {
      throw new BadRequestError('Email and OTP code are required');
    }

    // Normalize the code: trim whitespace and convert to string
    const normalizedCode = String(code).trim();

    console.log(`🔍 [otp.service.verifyOTP] Verifying OTP for ${email}`);
    console.log(`📌 [otp.service.verifyOTP] Received code: "${normalizedCode}" (length: ${normalizedCode.length})`);

    // Find the OTP record
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code: normalizedCode,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      console.warn(`❌ [otp.service.verifyOTP] OTP not found for ${email}`);
      throw new UnauthorizedError('Invalid OTP code');
    }

    // Check if OTP has expired
    if (new Date() > otp.expiresAt) {
      console.warn(`❌ [otp.service.verifyOTP] OTP expired for ${email}`);
      // Mark as used (expired)
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });
      throw new UnauthorizedError('OTP has expired');
    }

    // Check attempt count
    if (otp.attempts >= 5) {
      console.warn(`❌ [otp.service.verifyOTP] Too many attempts for ${email}`);
      // Mark as used (too many attempts)
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });
      throw new UnauthorizedError('Too many OTP verification attempts. Please request a new OTP.');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    console.log(`✅ [otp.service.verifyOTP] OTP verified successfully for ${email}`);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    console.error(`❌ [otp.service.verifyOTP] Error:`, error);
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (email) => {
  try {
    // Delete any existing unused OTPs for this email
    await prisma.oTP.deleteMany({
      where: {
        email,
        isUsed: false,
      },
    });

    // Send new OTP
    return await sendOTP(email);
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

/**
 * Clean up expired OTPs (run periodically)
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const deleted = await prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isUsed: false,
      },
    });

    console.log(`Cleaned up ${deleted.count} expired OTPs`);
    return deleted.count;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    throw error;
  }
};
