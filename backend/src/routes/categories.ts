/**
 * Monstore Backend - Categories Routes
 *
 * Category endpoints: list, get by ID/slug, CRUD (admin).
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import {
  listCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryController.js";

const router = Router();

// Public routes
router.get("/", listCategories);
router.get("/:id", getCategoryById);
router.get("/slug/:slug", getCategoryBySlug);

// Admin routes (authenticated + admin role)
router.post("/", authenticate, createCategory);
router.put("/:id", authenticate, updateCategory);
router.delete("/:id", authenticate, deleteCategory);

export default router;
