import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: import("@prisma/client/runtime/library").Enums.Role;
  email?: string;
}

/**
 * Verify Bearer token from Authorization header.
 * Sets req.userId, req.userRole, req.email when valid.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(); // not required — controllers decide what to do with missing auth
  }

  const token = authHeader.slice(7);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: import("@prisma/client/runtime/library").Enums.Role;
      email: string;
    };

    req.userId = payload.userId;
    req.userRole = payload.role;
    req.email = payload.email;
    next();
  } catch {
    // Token invalid/expired — still call next so downstream can return 401 if needed.
    // But we clear any accidental user info.
    delete req.userId;
    delete req.userRole;
    delete req.email;
    next();
  }
}

/**
 * Require authentication — must have a valid token.
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.userId || !req.userRole || !req.email) {
    throw new UnauthorizedError("You must be logged in to perform this action.");
  }
  next();
}

/**
 * Require ADMIN role.
 */
export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  requireAuth(req, _res, next);
  if (req.userRole !== "ADMIN") {
    throw new Forbidden("This action is restricted to administrators.");
  }
  next();
}

/**
 * Allow ADMIN or CUSTOMER (any authenticated user).
 */
export function requireAuthenticated(req: AuthRequest, _res: Response, next: NextFunction) {
  requireAuth(req, _res, next);
  next();
}
