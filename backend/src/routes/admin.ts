/**
 * Monstore Backend - Admin Routes
 *
 * Admin dashboard and management endpoints.
 * All routes require authentication + admin role.
 */

import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/AuthMiddleware.js";
import {
  getDashboard,
  listAdminProducts,
  listAdminUsers,
  updateAdminUser,
  getSales,
  getRevenue,
  listAdminAddresses,
} from "../controllers/AdminController.js";
import {
  listAdminOrders,
  updateAdminOrderStatus,
  markOrderPaidAdmin,
} from "../controllers/OrderController.js";

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", getDashboard);

// Products management
router.get("/products", listAdminProducts);

// Users management
router.get("/users", listAdminUsers);
router.patch("/users/:id", updateAdminUser);

// Orders management
router.get("/orders", listAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);
router.post("/orders/:id/paid", markOrderPaidAdmin);

// Sales & Revenue
router.get("/sales", getSales);
router.get("/revenue", getRevenue);

// Addresses (admin view)
router.get("/addresses", listAdminAddresses);

export default router;
