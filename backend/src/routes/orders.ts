/**
 * Monstore Backend - Orders Routes
 *
 * Order endpoints: create, list, get by ID, cancel (customer), admin order management.
 */

import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  listAdminOrders,
  updateAdminOrderStatus,
  markOrderPaidAdmin,
} from "../controllers/OrderController.js";

const router = Router();

// Customer routes (authenticated)
router.post("/", authenticate, createOrder);
router.get("/", authenticate, listOrders);
router.get("/:id", authenticate, getOrder);
router.patch("/:id/cancel", authenticate, cancelOrder);

// Admin routes (mounted separately in admin.ts)
// These are just declared here for organization but the actual admin
// middleware is applied in admin.ts

export { listAdminOrders, updateAdminOrderStatus, markOrderPaidAdmin };

export default router;
