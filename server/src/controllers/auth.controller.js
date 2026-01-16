// src/controllers/auth.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { validatePasswordStrength } from '../utils/password.js';
import { BadRequestError } from '../utils/errors.js';
import * as authService from '../services/auth.service.js';
import * as otpService from '../services/otp.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(passwordValidation.message);
  }

  // Register user
  const user = await authService.registerUser(email, password, name);

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Set refresh token in cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 * Response structure: { success: true, data: { user, accessToken } }
 */
export const login = asyncHandler(async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('🔐 [auth.controller.login] LOGIN REQUEST STARTED');
    console.log('═══════════════════════════════════════════════');
    
    const { email, password } = req.body;

    console.log('📋 [auth.controller.login] Request body:', {
      email,
      passwordLength: password?.length || 0,
      hasEmail: !!email,
      hasPassword: !!password,
    });

    // Validate input
    if (!email || !password) {
      console.warn('⚠️  [auth.controller.login] Missing credentials');
      console.log('⚠️  [auth.controller.login] Email:', email, 'Password:', !!password);
      throw new BadRequestError('Email and password are required');
    }

    console.log(`🔐 [auth.controller.login] Login attempt for: ${email}`);

    // Login user and generate tokens
    console.log('📞 [auth.controller.login] Calling authService.loginUser...');
    const result = await authService.loginUser(email, password);

    console.log('✅ [auth.controller.login] authService.loginUser returned successfully');
    console.log('✅ [auth.controller.login] Result keys:', Object.keys(result));
    console.log('✅ [auth.controller.login] User data:', {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    });
    console.log('✅ [auth.controller.login] Token generated');
    console.log(`🔑 [auth.controller.login] Generated access token with expiry: ${result.accessTokenExpiresIn}`);

    // Set refresh token in HTTP-only cookie
    console.log('🍪 [auth.controller.login] Setting refresh token cookie...');
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log('✅ [auth.controller.login] Refresh token cookie set');

    // Return standardized response
    // CRITICAL: Frontend expects this exact structure
    console.log('📤 [auth.controller.login] Building response...');
    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken, // JWT token string
        expiresIn: result.accessTokenExpiresIn, // For client-side refresh timing
      },
    };

    console.log('✅ [auth.controller.login] Response built:', {
      success: response.success,
      hasUser: !!response.data.user,
      hasToken: !!response.data.accessToken,
      hasExpiresIn: !!response.data.expiresIn,
    });

    res.status(200).json(response);

    console.log('✅ [auth.controller.login] LOGIN SUCCESS - Response sent');
    console.log('═══════════════════════════════════════════════\n');
  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('❌ [auth.controller.login] ERROR');
    console.error('═══════════════════════════════════════════════');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error status:', error.statusCode);
    console.error('❌ Full error:', error);
    console.error('═══════════════════════════════════════════════\n');
    
    throw error;
  }
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 * Response structure: { success: true, data: { user, accessToken } }
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    console.warn('⚠️  [auth.controller] Refresh token missing');
    throw new BadRequestError('Refresh token not provided');
  }

  console.log(`🔄 [auth.controller] Token refresh request`);

  const result = await authService.refreshAccessToken(refreshToken);

  console.log(`✅ [auth.controller] Token refreshed successfully`);
  console.log(`🔑 [auth.controller] New token expiry: ${result.accessTokenExpiresIn}`);

  res.status(200).json({
    success: true,
    message: 'Access token refreshed',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.accessTokenExpiresIn,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 * Requires valid JWT token
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!userId) {
    throw new BadRequestError('User not authenticated');
  }

  console.log(`🚪 [auth.controller] Logout for user: ${userId}`);

  // Invalidate refresh token
  if (refreshToken) {
    await authService.logoutUser(userId, refreshToken);
  }

  // Clear cookies
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  console.log(`✅ [auth.controller] User logged out: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user profile
 * GET /api/v1/auth/me
 * Requires valid JWT token in Authorization header or cookies
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  console.log('📋 [auth.controller.getMe] Request received');
  console.log('📋 [auth.controller.getMe] User ID from token:', userId);

  if (!userId) {
    console.warn('⚠️  [auth.controller.getMe] User ID missing from request');
    throw new BadRequestError('User not authenticated');
  }

  console.log(`📋 [auth.controller.getMe] Fetching profile for user: ${userId}`);

  const user = await authService.getUserProfile(userId);

  console.log(`✅ [auth.controller.getMe] Profile retrieved for user: ${userId}`);
  console.log(`✅ [auth.controller.getMe] Sending response with user:`, user);

  res.status(200).json({
    success: true,
    data: user,
  });

  console.log(`✅ [auth.controller.getMe] Response sent successfully`);
});

/**
 * Send OTP to email
 * POST /api/v1/auth/send-otp
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    throw new BadRequestError('Valid email is required');
  }

  const result = await otpService.sendOTP(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      expiresIn: result.expiresIn,
    },
  });
});

/**
 * Verify OTP and create user/login
 * POST /api/v1/auth/verify-otp
 * CRITICAL: User creation happens here (in auth.service.loginWithOTP)
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body;

  console.log(`🔐 [auth.controller.verifyOTP] Received verify OTP request for ${email}`);

  if (!email || !otp) {
    throw new BadRequestError('Email and OTP are required');
  }

  // Step 1: Verify OTP (otp.service.verifyOTP ONLY validates, does NOT create user)
  console.log(`📝 [auth.controller.verifyOTP] Verifying OTP...`);
  await otpService.verifyOTP(email, otp);
  console.log(`✅ [auth.controller.verifyOTP] OTP verified`);

  // Step 2: Login with OTP (auth.service.loginWithOTP creates user if needed)
  console.log(`👤 [auth.controller.verifyOTP] Creating/fetching user and generating tokens...`);
  const loginResult = await authService.loginWithOTP(email, name);
  console.log(`✅ [auth.controller.verifyOTP] User ready and tokens generated`);

  // Step 3: Set refresh token in secure cookie
  res.cookie('refreshToken', loginResult.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Step 4: Return success response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: loginResult.user,
      accessToken: loginResult.accessToken,
    },
  });

  console.log(`✅ [auth.controller.verifyOTP] OTP login successful for ${email}`);
});

/**
 * Resend OTP
 * POST /api/v1/auth/resend-otp
 */
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    throw new BadRequestError('Valid email is required');
  }

  const result = await otpService.resendOTP(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      expiresIn: result.expiresIn,
    },
  });
});
