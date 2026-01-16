// User controller using Prisma
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError, BadRequestError, NotFoundError } from "../utils/errors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { prisma } from "../config/database.js";

// Update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    console.log("Starting avatar upload...");
    
    // Get the uploaded avatar file path from multer
    const avatarLocalPath = req.file?.path;
    console.log("Avatar local path:", avatarLocalPath);

    // Validate that avatar file was uploaded
    if (!avatarLocalPath) {
      throw new BadRequestError("Avatar file is missing");
    }

    // Upload the avatar to Cloudinary
    console.log("Uploading to Cloudinary...");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Cloudinary response:", avatar);

    // Check if upload was successful
    if (!avatar?.url) {
      console.error("Cloudinary upload failed");
      throw new BadRequestError("Error while uploading avatar");
    }

    // Get user ID from JWT token (middleware sets req.user.userId)
    const userId = req.user?.userId;
    console.log("User ID:", userId);
    
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Update user's avatar URL in database using Prisma
    console.log("Updating database with avatar URL:", avatar.url);
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatar.url,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Avatar upload successful for user:", userId);
    
    // Return success response with updated user data
    return res.status(200).json(
      new ApiResponse(200, user, "Avatar updated successfully")
    );
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

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
      throw new NotFoundError("User");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User profile retrieved successfully"));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Validate input
    if (!name && !phoneNumber) {
      throw new BadRequestError("At least one field is required");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
});

// Set password for OTP-only users (who have no password yet)
const setUserPassword = asyncHandler(async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Validate input
    if (!newPassword) {
      throw new BadRequestError("New password is required");
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Check if user already has a password (can't use this endpoint)
    if (user.password) {
      throw new BadRequestError("This user already has a password. Use updateUserPassword instead.");
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    // Import bcrypt for hashing
    const bcrypt = await import("bcryptjs");
    
    // Hash new password
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // Set password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
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

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Password set successfully. You can now login with your email and password."));
  } catch (error) {
    console.error("Error setting password:", error);
    throw error;
  }
});

// Update user password
const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new BadRequestError("Current password and new password are required");
    }

    // Get user with password field
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Import bcrypt for password comparison
    const bcrypt = await import("bcryptjs");
    
    // Verify current password
    const isPasswordCorrect = await bcrypt.default.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new BadRequestError("New password must be at least 8 characters");
    }

    // Hash new password
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
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

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Password updated successfully"));
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
});

export { updateUserAvatar, getUserProfile, updateUserProfile, setUserPassword, updateUserPassword };
