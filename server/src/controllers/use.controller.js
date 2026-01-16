// Import the asyncHandler utility function from the utils folder
// asyncHandler is a higher-order function that wraps async functions
// It automatically catches any errors that occur in async operations
// Without this, you'd need to write try-catch blocks in every async controller
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { request } from "express";
import jwt from "jsonwebtoken"

// Define the registerUser controller function
// This function handles complete user registration with file uploads
const registerUser = asyncHandler(async (req, res) => {
    
    // STEP 1: Get user details from frontend (request body)
    // Extract user data from the request body using destructuring
    const { fullName, email, username, password } = req.body;

    // STEP 2: Validation - Check if all required fields are provided
    // Use the some() method to check if any field is empty after trimming whitespace
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // STEP 3: Check if user already exists with same username or email
    // Use MongoDB's $or operator to check both username and email
    // FIXED: Added 'await' keyword since User.findOne() returns a Promise
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    // If user already exists, throw an error
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // STEP 4: Check for uploaded files (avatar and cover image)
    // req.files is an object where each key is the field name from the form
    // Check if files were uploaded and avatar field exists
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
    // Initialize coverImageLocalPath variable to handle optional cover image
    let coverImageLocalPath;
    // Check if cover image was uploaded by verifying:
    // 1. req.files exists (multer processed files)
    // 2. coverImage field is an array (multer stores files as arrays)
    // 3. At least one file was uploaded for coverImage field
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        // Extract the file path from the first (and typically only) cover image file
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Avatar is required, throw error if not provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // STEP 5: Upload images to Cloudinary
    // Upload avatar (required) and cover image (optional) to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    // STEP 6: Create user object and save to database
    // Create new user with all the provided data
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // Use empty string if no cover image
        email,
        password, // Note: Password should be hashed in the User model (using pre-save middleware)
        username: username.toLowerCase()
    });

    // STEP 7: Remove password and refresh token from response
    // Fetch the created user but exclude sensitive fields using select()
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // STEP 8: Check for user creation and return response
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // STEP 9: Return success response
    // Send success response with created user data
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

// Helper function to generate access and refresh tokens for a user
async function generateAccessAndRefreshTokens(userId) {
    try {
        // Find the user by their ID
        const user = await User.findById(userId);

        // Defensive: Check if user exists
        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        // Generate access and refresh tokens using user instance methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Store the refresh token in the user document
        user.refreshToken = refreshToken;

        // Save the updated user document
        // FIXED: Changed 'ValiditeBeforSave' to 'validateBeforeSave' (correct spelling)
        await user.save({ validateBeforeSave: false });

        // Return both tokens
        return { accessToken, refreshToken };
    } catch (error) {
        // Wrap and rethrow errors as ApiError for consistent error handling
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

// Controller function to handle user login
const login = asyncHandler(async (req, res) => {
    // Extract credentials from request body
    const { email, username, password } = req.body;

    // Ensure either email or username is provided
    if (!(email || username)) {
        throw new ApiError(400, "Username or email is required");
    }

    // Find the user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    // If user not found, throw error
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if password is provided
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // Validate the provided password
    const passwordValid = await user.isPasswordCorrect(password);

    // If password is incorrect, throw error
    if (!passwordValid) {
        throw new ApiError(401, "Your password is incorrect, please check the password");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Fetch user data without sensitive fields
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    // Cookie options for security
    const options = {
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: true,   // Ensures cookie is sent over HTTPS only
    };

    // Send response with cookies and user data
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Update user document to remove refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    // Cookie options for security
    const options = {
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: true,   // Ensures cookie is sent over HTTPS only
    };

    // Clear cookies and send success response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});



// Controller function to refresh access token using refresh token
// This function allows users to get a new access token when the current one expires
// without requiring them to log in again
const refreshAccessToken = asyncHandler(async (req, res) => {
    // STEP 1: Extract refresh token from cookies or request body
    // Check both cookies and body to support different client implementations
    // Web browsers typically send cookies, mobile apps might send in body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // STEP 2: Validate that refresh token exists
    // If no refresh token is provided, user needs to login again
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // STEP 3: Verify and decode the refresh token
        // This checks if the token is valid and not expired
        // FIXED: Added missing variable declaration and correct secret
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET // Use refresh token secret, not access token secret
        );

        // STEP 4: Find user from decoded token
        // Extract user ID from the decoded token and fetch user from database
        const user = await User.findById(decodedToken?._id);

        // STEP 5: Check if user exists
        // If user is not found, the token might be invalid or user was deleted
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // STEP 6: Verify refresh token matches stored token
        // Compare the incoming token with the one stored in database
        // This prevents token reuse attacks and ensures token validity
        // FIXED: Corrected property name from refreshAccessToken to refreshToken
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // STEP 7: Generate new tokens
        // Create fresh access and refresh tokens for the user
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        // STEP 8: Set cookie options for security
        // Configure secure cookie settings
        const options = {
            httpOnly: true, // Prevents client-side JS from accessing cookies
            secure: true,   // Ensures cookies are sent over HTTPS only
        };

        // STEP 9: Send response with new tokens
        // Return new tokens both in cookies and response body
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        // STEP 10: Handle any errors during token refresh
        // This could be due to invalid token, expired token, or database errors
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});


// Controller function to change user's current password
// This function allows authenticated users to update their password
// Requires both old password (for verification) and new password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    // STEP 1: Extract old and new passwords from request body
    const { oldPassword, newPassword } = req.body;

    // STEP 2: Validate that both passwords are provided
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    // STEP 3: Find the current user from the database
    // req.user._id comes from the JWT middleware (verifyJWT)
    // FIXED: Changed req.user?.id to req.user?._id (correct property name)
    const user = await User.findById(req.user?._id);

    // STEP 4: Verify the old password is correct
    // Use the user model's method to check password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    // STEP 5: If old password is incorrect, throw error
    if (!isPasswordCorrect) {
        // FIXED: Changed throw new Error to throw new ApiError for consistency
        throw new ApiError(400, "Invalid old password");
    }

    // STEP 6: Update the user's password
    // The new password will be automatically hashed by the User model's pre-save middleware
    user.password = newPassword;
    
    // STEP 7: Save the updated user to database
    // validateBeforeSave: false prevents running validation on other fields
    await user.save({ validateBeforeSave: false });

    // STEP 8: Return success response
    // Don't include any sensitive data in response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Controller function to get current authenticated user's information
// This function returns the current user's data (excluding sensitive information)
const getCurrentUser = asyncHandler(async (req, res) => {
    // STEP 1: Return current user data
    // req.user comes from JWT middleware and already excludes password and refreshToken
    // FIXED: Corrected ApiResponse constructor parameters
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Controller function to update user's account details (non-sensitive information)
// This function allows users to update their fullName and email
const updateAccountDetails = asyncHandler(async (req, res) => {
    // STEP 1: Extract account details from request body
    const { fullName, email } = req.body;

    // STEP 2: Validate that required fields are provided
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    // STEP 3: Update user document in database
    // FIXED: Added missing 'await' and 'const' keywords
    // FIXED: Changed 'user.findByIdAndUpdate' to 'User.findByIdAndUpdate'
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true } // Returns the updated document
    ).select("-password"); // Exclude password from response

    // STEP 4: Check if user was found and updated
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // STEP 5: Return success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Controller function to update user's avatar image
// This function handles avatar file upload and updates user's avatar URL
const updateUserAvatar = asyncHandler(async (req, res) => {
    // STEP 1: Get the uploaded avatar file path from multer
    const avatarLocalPath = req.file?.path;

    // STEP 2: Validate that avatar file was uploaded
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // STEP 3: Upload the avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // STEP 4: Check if upload was successful
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // STEP 5: Update user's avatar URL in database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    // STEP 6: Return success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Controller function to update user's cover image
// This function handles cover image file upload and updates user's cover image URL
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // STEP 1: Get the uploaded cover image file path from multer
    const coverImageLocalPath = req.file?.path;

    // STEP 2: Validate that cover image file was uploaded
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    // STEP 3: Upload the cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // STEP 4: Check if upload was successful
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    // STEP 5: Update user's cover image URL in database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password");

    // STEP 6: Return success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
});



// Export all controller functions so they can be imported in other files
// This allows the router (user.router.js) to use these controller functions
// The export uses named export syntax, so they must be imported with destructuring
export { 
    registerUser, 
    login, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
