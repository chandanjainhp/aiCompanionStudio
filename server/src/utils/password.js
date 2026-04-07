// src/utils/password.js
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 12;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain uppercase, lowercase, number, and special character',
    };
  }

  return { isValid: true };
};

/**
 * Hash password with bcrypt
 */
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};
