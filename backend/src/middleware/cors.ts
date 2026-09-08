/**
 * Monstore Backend - CORS Middleware
 *
 * Configures CORS to allow requests from the frontend only.
 */

import cors, { CorsOptions } from "cors";
import { config } from "../config/index.js";

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow the frontend origin
    const allowedOrigins = [
      config.frontendUrl,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://monsstore.vercel.app",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow all origins for testing
      if (config.nodeEnv !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: ${origin} not allowed`));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

export const corsMiddleware = cors(corsOptions);
