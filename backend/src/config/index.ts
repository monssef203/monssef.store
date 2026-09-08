/**
 * Monstore Backend - Configuration
 *
 * Environment variables and application configuration.
 */

import "dotenv/config";

export const config = {
  // Server
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: (process.env.NODE_ENV || "development") as "development" | "production" | "test",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Admin (from seed)
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",

  // Email (resett password - optional)
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@monsstore.ma",
};

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}

export function isDevelopment(): boolean {
  return config.nodeEnv === "development";
}

export function isTest(): boolean {
  return config.nodeEnv === "test";
}
