// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export const generateAccessToken = (userId, email) => {
  const token = jwt.sign(
    { userId, email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  
  console.log(`🔑 [jwt.utils] Generated access token for user: ${email}, expires in: ${config.jwtExpiresIn}`);
  
  return token;
};

export const generateRefreshToken = (userId) => {
  const token = uuidv4();
  console.log(`🔄 [jwt.utils] Generated refresh token for user ID: ${userId}`);
  return token;
};

export const signRefreshToken = (token) => {
  return jwt.sign(
    { token },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
};

export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log(`✅ [jwt.utils] Token verified for user: ${decoded.email}`);
    return decoded;
  } catch (error) {
    console.warn(`⚠️  [jwt.utils] Token verification failed: ${error.message}`);
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
