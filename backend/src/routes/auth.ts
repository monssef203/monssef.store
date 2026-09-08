/**
 * Monstore Backend - Auth Routes
 *
 * Authentication endpoints: register, login, logout, profile, password management.
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { rateLimiter } from "../middleware/rateLimit.js";
import {
  register,
  login,
  logout,
  me,
  updateProfileHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "../controllers/AuthController.js";

const router = Router();

// Apply rate limiting for auth endpoints
router.use(rateLimiter);

// Register (public)
router.post("/register", register);

// Login (public)
router.post("/login", login);

// Logout (authenticated or not - clears cookie)
router.post("/logout", logout);

// Get current user (authenticated)
router.get("/me", authenticate, me);

// Update profile (authenticated)
router.patch("/profile", authenticate, updateProfileHandler);

// Change password (authenticated)
router.post("/change-password", authenticate, changePasswordHandler);

// Forgot password (public - sends reset email)
router.post("/forgot-password", forgotPasswordHandler);

// Reset password (public - uses token)
router.post("/reset-password", resetPasswordHandler);

export default router;
