// src/services/auth.service.js
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { sendWelcomeEmail } from '../../email/emails.js';

/**
 * Register a new user
 */
export const registerUser = async (email, password, name) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with default chat quota (10 chats)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      chatLimit: 10,        // QUOTA: New users get 10 chats
      chatUsageCount: 0,    // QUOTA: Start at 0 usage
    },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.warn('⚠️ Failed to send welcome email:', emailError.message);
    // Don't block registration if email fails
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 [auth.service.loginUser] Starting login process...');
    console.log('🔐 [auth.service.loginUser] Email:', email);

    // Find user by email
    console.log('🔍 [auth.service.loginUser] Searching for user in database...');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('🔍 [auth.service.loginUser] User search result:', {
      found: !!user,
      id: user?.id,
    });

    if (!user) {
      console.warn('⚠️  [auth.service.loginUser] User not found with email:', email);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user has a password
    if (!user.password) {
      console.warn('⚠️  [auth.service.loginUser] User has no password set (likely OTP-registered):', email);
      console.log('💾 [auth.service.loginUser] Setting password for OTP-registered user...');

      // Hash the provided password
      const passwordHash = await hashPassword(password);

      // Update user with password
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      });

      console.log('✅ [auth.service.loginUser] Password set successfully for user:', email);

      // Continue with the updated user
      const accessToken = generateAccessToken(updatedUser.id, updatedUser.email);
      console.log('✅ [auth.service.loginUser] Access token generated');

      const refreshTokenValue = generateRefreshToken(updatedUser.id);
      console.log('✅ [auth.service.loginUser] Refresh token generated');

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: updatedUser.id,
          expiresAt,
        },
      });
      console.log('✅ [auth.service.loginUser] Refresh token stored');

      console.log('✅ [auth.service.loginUser] User authenticated successfully (password setup)');

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
        },
        accessToken,
        refreshToken: refreshTokenValue,
        accessTokenExpiresIn: config.jwtExpiresIn,
      };
    }

    console.log('✅ [auth.service.loginUser] User password verified to exist');

    // Verify password
    console.log('🔒 [auth.service.loginUser] Verifying password...');
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.warn('⚠️  [auth.service.loginUser] Password verification failed for user:', email);
      throw new UnauthorizedError('Invalid email or password');
    }

    console.log('✅ [auth.service.loginUser] Password verified');

    // Generate tokens
    console.log('🔑 [auth.service.loginUser] Generating access token...');
    const accessToken = generateAccessToken(user.id, user.email);
    console.log('✅ [auth.service.loginUser] Access token generated');

    console.log('🔑 [auth.service.loginUser] Generating refresh token...');
    const refreshTokenValue = generateRefreshToken(user.id);
    console.log('✅ [auth.service.loginUser] Refresh token generated');

    // Store refresh token in database
    console.log('💾 [auth.service.loginUser] Storing refresh token in database...');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });
    console.log('✅ [auth.service.loginUser] Refresh token stored');

    console.log('✅ [auth.service.loginUser] User authenticated successfully');
    console.log('✅ [auth.service.loginUser] User ID:', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken: refreshTokenValue,
      accessTokenExpiresIn: config.jwtExpiresIn,
    };
  } catch (error) {
    console.error('❌ [auth.service.loginUser] Error during login:', error.message);
    console.error('❌ [auth.service.loginUser] Error details:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  // Find refresh token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new UnauthorizedError('Refresh token expired');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.email
  );

  console.log(`✅ [auth.service] Token refreshed for user: ${storedToken.user.email}`);

  return {
    accessToken: newAccessToken,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      avatarUrl: storedToken.user.avatarUrl,
    },
    accessTokenExpiresIn: config.jwtExpiresIn,
  };
};

/**
 * Logout user
 */
export const logoutUser = async (userId, refreshToken) => {
  // Delete refresh token from database
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      token: refreshToken,
    },
  });

  return { success: true };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

/**
 * Login with OTP (after OTP verification)
 * CRITICAL: This is the ONLY place where users are created for OTP flow
 */
export const loginWithOTP = async (email, name = '') => {
  try {
    console.log(`🔐 [auth.service.loginWithOTP] Processing OTP login for ${email}`);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(`🔍 [auth.service.loginWithOTP] User lookup result:`, {
      exists: !!user,
      email: user?.email,
    });

    // If user doesn't exist, create them (this is the only place for OTP flow)
    if (!user) {
      console.log(`👤 [auth.service.loginWithOTP] Creating new user for ${email}`);
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: '', // Empty for OTP-only users (no password set)
          isVerified: true, // Mark as verified since OTP was successfully verified
          chatLimit: 10,        // QUOTA: New users get 10 chats
          chatUsageCount: 0,    // QUOTA: Start at 0 usage
        },
      });
      console.log(`✅ [auth.service.loginWithOTP] User created:`, {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      });

      // Send welcome email for new user
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.warn('⚠️ Failed to send welcome email:', emailError.message);
        // Don't block login if email fails
      }
    } else {
      console.log(`✅ [auth.service.loginWithOTP] Existing user found:`, {
        id: user.id,
        email: user.email,
      });
      // Update isVerified flag for existing users
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // Generate tokens
    console.log(`🔑 [auth.service.loginWithOTP] Generating access token`);
    const accessToken = generateAccessToken(user.id, user.email);
    console.log(`✅ [auth.service.loginWithOTP] Access token generated`);

    console.log(`🔑 [auth.service.loginWithOTP] Generating refresh token`);
    const refreshTokenValue = generateRefreshToken(user.id);
    console.log(`✅ [auth.service.loginWithOTP] Refresh token generated`);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });
    console.log(`💾 [auth.service.loginWithOTP] Refresh token stored`);

    console.log(`✅ [auth.service.loginWithOTP] OTP login successful for ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken: refreshTokenValue,
    };
  } catch (error) {
    console.error(`❌ [auth.service.loginWithOTP] Error:`, error);
    throw error;
  }
};
