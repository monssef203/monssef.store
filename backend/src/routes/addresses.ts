/**
 * Monstore Backend - Addresses Routes
 *
 * Address endpoints: list, get by ID, create, update, delete (customer).
 * Admin can also view all addresses.
 */

import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/AuthMiddleware.js";
import {
  listAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  listAdminAddresses,
} from "../controllers/AddressController.js";

const router = Router();

// Customer routes (authenticated)
router.get("/", authenticate, listAddresses);
router.get("/:id", authenticate, getAddressById);
router.post("/", authenticate, createAddress);
router.put("/:id", authenticate, updateAddress);
router.delete("/:id", authenticate, deleteAddress);

// Admin route (admin only) - view all addresses
router.get("/admin/all", authenticate, requireAdmin, listAdminAddresses);

export default router;
