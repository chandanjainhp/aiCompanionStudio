// src/middlewares/auth.middle.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header or cookies
 * Attaches decoded user data to req.user
 * 
 * CRITICAL NOTES:
 * - Token must be present in Authorization header (Bearer <token>) OR cookies
 * - Decodes token and validates user still exists in database
 * - Throws 401 if token missing, invalid, or user deleted
 * - Does NOT re-check tokens on every request (expensive)
 * - Uses JWT verification which is cryptographically secure
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    console.log(`🔐 [verifyJWT] Verifying token for endpoint: ${req.method} ${req.originalUrl}`);
    
    // Extract token from Authorization header (Bearer token) or cookies
    const authHeader = req.header('Authorization');
    const tokenFromHeader = authHeader?.replace('Bearer ', '') || null;
    const tokenFromCookie = req.cookies?.accessToken;
    
    // Use header token if available, otherwise fall back to cookie
    const token = tokenFromHeader || tokenFromCookie;

    console.log(`🔐 [verifyJWT] Token source: header=${!!tokenFromHeader}, cookie=${!!tokenFromCookie}`);

    if (!token) {
      console.warn('⚠️  [verifyJWT] No authentication token provided');
      throw new UnauthorizedError('No authentication token provided');
    }

    console.log(`🔐 [verifyJWT] Verifying token for endpoint: ${req.method} ${req.originalUrl}`);

    // Verify and decode the token
    // This throws if token is invalid or expired
    const decoded = verifyAccessToken(token);

    console.log(`🔐 [verifyJWT] Token decoded. User ID: ${decoded.userId}`);

    // Fetch user from database to ensure they still exist
    // Prevents using tokens of deleted users
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.warn(`⚠️  [verifyJWT] User not found in database. User ID: ${decoded.userId}`);
      throw new UnauthorizedError('User not found');
    }

    // Attach user info to request object for use in route handlers
    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    console.log(`✅ [verifyJWT] SUCCESS for user: ${user.email}`);

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error(`🚫 [verifyJWT] Authorization failed: ${error.message}`);
      throw error;
    }
    
    console.error(`🚫 [verifyJWT] Token verification failed: ${error.message}`);
    throw new UnauthorizedError('Invalid or expired token');
  }
});

/**
 * Verify Project Ownership
 * Ensures user owns the project they're trying to access
 * Used in project-specific routes
 */
export const verifyProjectOwnership = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user?.userId;

  console.log('🔐 [verifyProjectOwnership] Checking access:', {
    projectId,
    userId,
    userExists: !!req.user,
  });

  if (!projectId) {
    throw new ForbiddenError('Project ID not provided');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  console.log('🔍 [verifyProjectOwnership] Project lookup:', {
    found: !!project,
    projectId,
    projectOwner: project?.userId,
    requestingUser: userId,
    match: project?.userId === userId,
  });

  // Check if project exists first
  if (!project) {
    console.warn(`⚠️  [verifyProjectOwnership] Project does not exist: ${projectId}`);
    throw new ForbiddenError('Project does not exist');
  }

  // Check if user owns the project
  if (project.userId !== userId) {
    console.warn(`⚠️  [verifyProjectOwnership] Access denied - User ownership mismatch:`, {
      projectId,
      projectOwnerId: project.userId,
      requestingUserId: userId,
    });
    throw new ForbiddenError('You do not have access to this project');
  }

  // Attach project to request for use in handlers
  req.project = project;
  next();
});

/**
 * Verify Conversation Ownership
 * Ensures user owns the conversation they're trying to access
 */
export const verifyConversationOwnership = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user?.userId;

  if (!conversationId) {
    throw new ForbiddenError('Conversation ID not provided');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { project: true },
  });

  if (!conversation) {
    throw new ForbiddenError('Conversation not found');
  }

  // Check if user owns the project this conversation belongs to
  if (conversation.project.userId !== userId) {
    throw new ForbiddenError('You do not have access to this conversation');
  }

  req.conversation = conversation;
  next();
});
