/**
 * Monstore Backend - Rate Limiting Middleware
 *
 * Prevents abuse and protects the API from excessive requests.
 */

import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === "production" ? 100 : 200, // requests per window
  message: {
    error: "Too many requests, please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    error: "Too many authentication attempts, please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Product listing can have higher limits
export const productLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: "Too many product requests, please try again later.",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
