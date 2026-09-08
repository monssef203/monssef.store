/**
 * MONSTORE Backend API
 *
 * Express application entry point.
 * Provides REST API for MONSTORE / AUREN STORE e-commerce platform.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { corsMiddleware } from "./src/middleware/cors.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { authenticate } from "./src/middleware/AuthMiddleware.js";
import { notFoundHandler } from "./src/middleware/errorHandler.js";

// Routes
import authRoutes from "./src/routes/auth.js";
import productRoutes from "./src/routes/products.js";
import categoryRoutes from "./src/routes/categories.js";
import cartRoutes from "./src/routes/cart.js";
import orderRoutes from "./src/routes/orders.js";
import adminRoutes from "./src/routes/admin.js";
import addressRoutes from "./src/routes/addresses.js";
import reviewRoutes from "./src/routes/reviews.js";
import imageRoutes from "./src/routes/images.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// CORS
app.use(corsMiddleware);

// Cookie parsing (for JWT tokens)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Authentication middleware (applied globally - sets req.user if token present)
app.use(authenticate);

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/images", imageRoutes);

// Root redirect
app.get("/", (req, res) => {
  res.json({
    name: "MONSTORE API",
    version: "1.0.0",
    description: "Backend API for MONSTORE / AUREN STORE",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      products: "/api/products/*",
      categories: "/api/categories/*",
      cart: "/api/cart/*",
      orders: "/api/orders/*",
      admin: "/api/admin/*",
      addresses: "/api/addresses/*",
      reviews: "/api/reviews/*",
      images: "/api/images/*",
    },
  });
});

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   MONSTORE BACKEND API                                   ║
║   Running on http://0.0.0.0:${PORT}            ║
║   Environment: ${process.env.NODE_ENV || "development"}                       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
