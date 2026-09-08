/**
 * Monstore Backend - Reviews Routes
 *
 * Review endpoints: get product reviews, get my reviews, create, update, delete.
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/ReviewController.js";

const router = Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Authenticated routes
router.post("/", authenticate, createReview);
router.get("/my", authenticate, getMyReviews);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
