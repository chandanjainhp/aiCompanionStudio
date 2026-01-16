// IMPORTS SECTION
// ================

// Import 'watch' from Node.js 'fs' module - used for file system operations
// NOTE: This import seems unused in current code and can be removed
import { watch } from "fs";

// Import Mongoose ODM (Object Document Mapper) for MongoDB
// Schema is imported separately for creating database schemas
import mongoose, {Schema} from "mongoose";

// Import jsonwebtoken library for creating and verifying JWT tokens
// Used for authentication and authorization
import jwt from "jsonwebtoken"

// Import bcrypt library for password hashing
// Provides secure password encryption and comparison
import bcrypt from "bcrypt"


// USER SCHEMA DEFINITION
// ======================

// Create a new Mongoose schema for User collection
const userSchema = new Schema({
    
    // USERNAME FIELD
    // ==============
    username : {
        type: String,                    // Data type: String
        required: true,                  // Field is mandatory
        unique: true,                    // Must be unique across all users
        lowercase: true,                 // Automatically converts to lowercase
        trim: true,                      // Removes whitespace from beginning/end
        index: true                      // Creates database index for faster queries
    },
    
    // EMAIL FIELD
    // ===========
    email: {
        type: String,                    // Data type: String
        required: true,                  // Field is mandatory
        unique: true,                    // Must be unique across all users
        lowercase: true,                 // Automatically converts to lowercase
        index: true,                     // Creates database index for faster queries
    },
    
    // FULL NAME FIELD
    // ===============
    fullName: {
        type: String,                    // Data type: String
        required: true,                  // Field is mandatory
        // NOTE: unique:true might not be ideal for fullName as multiple people can have same name
        unique: true,                    // Currently set to unique (consider removing)
        trim: true,                      // Removes whitespace from beginning/end
        index: true,                     // Creates database index for faster queries
    },
    
    // AVATAR FIELD
    // ============
    avatar: {
        type: String,                    // Data type: String
        // This will store Cloudinary URL for user's profile picture
        required: true,                  // Field is mandatory
        // NOTE: unique:true might not be needed for avatar URLs
        unique: true,                    // Currently set to unique (consider removing)
        index: true                      // Creates database index for faster queries
    },
    
    // COVER IMAGE FIELD
    // =================
    coverImage: {                     
        type: String,                    // Data type: String
        // This will store Cloudinary URL for user's cover photo
        // Not required, so users can have no cover image
    },
    
    // WATCH HISTORY FIELD
    // ===================
    watchHistory: [                  
        {
            type: Schema.Types.ObjectId, // Reference to another document's ObjectId
            ref: "Video"                 // References the Video model/collection
        }
    ],
    
    // PASSWORD FIELD
    // ==============
    password: {
        type: String,                    // Data type: String
        required: [true, 'Password is required'] // Required with custom error message
        // Password will be hashed before saving (see pre-save middleware below)
    },
    
    // REFRESH TOKEN FIELD
    // ===================
    refreshToken: {                      // Fixed typo: was 'RefershToken'
        type: String                     // Data type: String
        // Used to store JWT refresh tokens for maintaining user sessions
        // Not required as it's only set when user logs in
    }
    
}, {
    // SCHEMA OPTIONS
    // ==============
    timestamps: true,                    // Automatically adds createdAt and updatedAt fields
})

// MIDDLEWARE SECTION
// ==================

// PRE-SAVE MIDDLEWARE FOR PASSWORD HASHING
// =========================================
// This middleware runs before saving a user document to the database
userSchema.pre("save", async function (next) {
    // Check if password field has been modified
    // If password hasn't changed, skip hashing and proceed to next middleware
    if(!this.isModified("password")) return next();

    // Hash the password using bcrypt with salt rounds of 10
    // Higher salt rounds = more secure but slower processing
    this.password = await bcrypt.hash(this.password, 10); // Fixed: added 'await'
    
    // Call next() to proceed to the next middleware or save operation
    next();
});


// INSTANCE METHODS SECTION
// ========================

// METHOD TO VERIFY PASSWORD
// =========================
// This method compares a plain text password with the hashed password
userSchema.methods.isPasswordCorrect = async function(password) {
    // Use bcrypt.compare to check if plain password matches hashed password
    // Returns true if passwords match, false otherwise
    return await bcrypt.compare(password, this.password);
}

// METHOD TO GENERATE ACCESS TOKEN
// ===============================
// Creates a JWT access token containing user information
userSchema.methods.generateAccessToken = function() {
    // Sign and return a JWT token with user payload
    return jwt.sign(
        {
            // Payload: Information to include in the token
            _id: this._id,               // User's unique ID
            email: this.email,           // User's email
            username: this.username,     // User's username
            fullName: this.fullName      // User's full name
        },
        // Secret key for signing the token (should come from environment variables)
        process.env.ACCESS_TOKEN_SECRET,
        {
            // Token expiration time
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
    );
}

// METHOD TO GENERATE REFRESH TOKEN
// ================================
// Creates a JWT refresh token for maintaining user sessions
userSchema.methods.generateRefreshToken = function() {
    // Sign and return a refresh token with minimal payload
    return jwt.sign(
        {
            // Minimal payload for refresh token (just user ID)
            _id: this._id,
        },
        // Secret key for signing refresh token (should be different from access token secret)
        process.env.REFRESH_TOKEN_SECRET,
        {
            // Longer expiration time for refresh tokens
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    );
}

// MODEL EXPORT
// ============
// Create and export the User model based on userSchema
export const User = mongoose.model("User", userSchema)
