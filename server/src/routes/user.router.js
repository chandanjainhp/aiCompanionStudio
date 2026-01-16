// Import Router from Express to create modular route handlers
import { Router } from "express";

// Import the user controller functions
import { updateUserAvatar, getUserProfile, updateUserProfile, setUserPassword, updateUserPassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middle.js";

// Create a new router instance
// This router will handle all user-related routes
const router = Router();

// Test route to check if the server is working
router.route("/test").get((req, res) => {
  res.json({ message: "User routes are working!" });
});

// SECURED ROUTES - These routes require authentication

// GET /profile - Get user profile
router.route("/profile").get(verifyJWT, getUserProfile);

// PATCH /profile - Update user profile (name, phoneNumber)
router.route("/profile").patch(verifyJWT, updateUserProfile);

// POST /set-password - Set password for OTP-only users
router.route("/set-password").post(verifyJWT, setUserPassword);

// PATCH /password - Update user password
router.route("/password").patch(verifyJWT, updateUserPassword);

// POST /avatar - Upload user avatar
router.route("/avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Export the router as default so it can be imported in app.js
export default router;