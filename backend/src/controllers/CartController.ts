/**
 * Monstore Backend - Cart Controller
 *
 * HTTP handlers for cart endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/AuthMiddleware.js";
import * as CartService from "../services/cartService.js";
import { sendJSON, sendError } from "../utils/helpers.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const cart = await CartService.getUserCart(req.user.id);
    return sendJSON(res, 200, cart);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/cart/items
// ─────────────────────────────────────────────

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { productId, quantity } = req.body;

    if (!productId) {
      throw new ValidationError("Product ID is required.");
    }

    const quantityNum = quantity ? parseInt(quantity as string) : 1;
    if (isNaN(quantityNum) || quantityNum < 1) {
      throw new ValidationError("Quantity must be at least 1.");
    }

    const result = await CartService.addToCart(req.user.id, productId, quantityNum);
    return sendJSON(res, 201, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/cart/items/:id
// ─────────────────────────────────────────────

export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || typeof quantity !== "number" || quantity < 1) {
      throw new ValidationError("Quantity must be at least 1.");
    }

    const cart = await CartService.updateCartItem(req.user.id, id, quantity);
    return sendJSON(res, 200, cart);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/cart/items/:id
// ─────────────────────────────────────────────

export async function removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const cart = await CartService.removeFromCart(req.user.id, id);
    return sendJSON(res, 200, cart);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/cart
// ─────────────────────────────────────────────

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const result = await CartService.clearCart(req.user.id);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/cart/merge (Guest → User sync)
// ─────────────────────────────────────────────

export async function mergeGuestCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { guestItems } = req.body;

    if (!guestItems || !Array.isArray(guestItems)) {
      throw new ValidationError("Guest items array is required.");
    }

    for (const item of guestItems) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity < 1) {
        throw new ValidationError("Each guest item must have a valid productId and quantity >= 1.");
      }
    }

    const cart = await CartService.mergeGuestCart(req.user.id, guestItems);
    return sendJSON(res, 200, {
      message: "Guest cart merged successfully.",
      cart,
    });
  } catch (error) {
    next(error);
  }
}
