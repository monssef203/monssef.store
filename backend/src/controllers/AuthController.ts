/**
 * Monstore Backend - Auth Controller
 *
 * HTTP handlers for authentication endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { authenticate, generateToken } from "../middleware/AuthMiddleware.js";
import { registerUser, loginUser, getCurrentUser, updateProfile, changePassword, logoutUser, requestPasswordReset, resetPassword } from "../services/authService.js";
import { sendJSON, sendError, parsePagination } from "../utils/helpers.js";

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Set cookie with JWT
    res.cookie("token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendJSON(res, 201, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    const result = await loginUser({
      email,
      password,
    });

    // Set cookie with JWT
    res.cookie("token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Clear cookie
    res.clearCookie("token");

    const result = await logoutUser();
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // authenticate middleware already ran and set req.user
    if (!req.user) {
      return sendError(res, 401, "Not authenticated.");
    }

    const user = await getCurrentUser(req.user.id);
    return sendJSON(res, 200, { user });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/auth/profile
// ─────────────────────────────────────────────

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      return sendError(res, 401, "Not authenticated.");
    }

    const { firstName, lastName, phone, email } = req.body;

    const updatedUser = await updateProfile(req.user.id, {
      firstName,
      lastName,
      phone,
      email,
    });

    return sendJSON(res, 200, { user: updatedUser, message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/change-password
// ─────────────────────────────────────────────

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      return sendError(res, 401, "Not authenticated.");
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current password and new password are required.");
    }

    const result = await changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });

    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required.");
    }

    const result = await requestPasswordReset(email);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 400, "Token and new password are required.");
    }

    const result = await resetPassword(token, newPassword);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}
