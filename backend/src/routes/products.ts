/**
 * Monstore Backend - Products Routes
 *
 * Product endpoints: list, get by ID, get by slug, CRUD (admin), related products, stock management.
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import productLimiter from "../middleware/rateLimit.js";
import {
  listProducts,
  listFeaturedProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  updateProductStock,
} from "../controllers/ProductController.js";

const router = Router();

// Apply rate limiting
router.use(productLimiter);

// Public routes
router.get("/", listProducts);
router.get("/featured", listFeaturedProducts);
router.get("/related/:productId", getRelatedProducts);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);

// Admin routes (authenticated + admin role)
router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);
router.post("/:id/stock", authenticate, updateProductStock);

export default router;
