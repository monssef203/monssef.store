/**
 * Monstore Backend - Cart Routes
 *
 * Cart endpoints: get cart, add item, update item, remove item, clear cart, merge guest cart.
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from "../controllers/CartController.js";

const router = Router();

// All cart routes require authentication (server cart is for logged-in users only)
router.use(authenticate);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/items", addToCart);

// Update cart item quantity
router.put("/items/:id", updateCartItem);

// Remove item from cart
router.delete("/items/:id", removeCartItem);

// Clear cart
router.delete("/", clearCart);

// Merge guest cart (after login)
router.post("/merge", mergeGuestCart);

export default router;
