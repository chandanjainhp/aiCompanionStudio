// src/routes/auth.router.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middle.js';
import { authRateLimiter } from '../middlewares/rate-limit.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../utils/validation.js';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */
router.post(
  '/register',
  authRateLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post('/refresh', authController.refresh);

/**
 * OTP routes
 */
router.post('/send-otp', authRateLimiter, authController.sendOTP);
router.post('/verify-otp', authRateLimiter, authController.verifyOTP);
router.post('/resend-otp', authRateLimiter, authController.resendOTP);

/**
 * Protected routes (authentication required)
 */
router.post('/logout', verifyJWT, authController.logout);
router.get('/me', verifyJWT, authController.getMe);

export default router;
