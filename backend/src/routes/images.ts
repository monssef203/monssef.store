/**
 * Monstore Backend - Images Routes
 *
 * Product image endpoints: list, create, update, delete (admin).
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import {
  getProductImages,
  createProductImage,
  updateProductImage,
  deleteProductImage,
} from "../controllers/ProductImageController.js";

const router = Router();

// Public route - view images
router.get("/products/:productId/images", getProductImages);

// Admin routes - manage images
router.post("/products/:productId/images", authenticate, createProductImage);
router.put("/products/:productId/images/:imageId", authenticate, updateProductImage);
router.delete("/products/:productId/images/:imageId", authenticate, deleteProductImage);

export default router;
