/**
 * Monstore Backend - Order Controller
 *
 * HTTP handlers for order endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import * as OrderService from "../services/orderService.js";
import { sendJSON, sendError } from "../utils/helpers.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────────

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const {
      items,
      fullName,
      phone,
      city,
      address,
      email,
      notes,
      shippingLabel,
      useDefaultAddress,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError("Your cart is empty. Add some products first.");
    }

    if (useDefaultAddress) {
      // Get user's default address
      const user = await import("@prisma/client").then(({ PrismaClient }) => {
        const prisma = new PrismaClient();
        return prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        });
      });

      if (user?.addresses[0]) {
        fullName = fullName || user.addresses[0].fullName;
        phone = phone || user.addresses[0].phone;
        city = city || user.addresses[0].city;
        address = address || user.addresses[0].address;
      }
    }

    if (!fullName || !phone || !city || !address) {
      throw new ValidationError(
        "Please provide your full name, phone, city, and address. You can also save a default address and use it."
      );
    }

    const order = await OrderService.createOrder(req.user.id, {
      items,
      fullName,
      phone,
      city,
      address,
      email,
      notes,
      shippingLabel,
    });

    return sendJSON(res, 201, {
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/orders
// ─────────────────────────────────────────────

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { page, limit, status } = req.query;
    const pagination = parsePagination(req.query, { page: 1, limit: 20 });

    const orders = await OrderService.getUserOrders(req.user.id, {
      page: pagination.page,
      limit: pagination.limit,
      status: status as string | undefined,
    });

    return sendJSON(res, 200, orders);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/orders/:id
// ─────────────────────────────────────────────

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const order = await OrderService.getOrderById(id, req.user.id, false);
    return sendJSON(res, 200, { order });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/cancel
// ─────────────────────────────────────────────

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const result = await OrderService.cancelOrder(id, req.user.id);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Admin: GET /api/admin/orders
// ─────────────────────────────────────────────

export async function listAdminOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { page, limit, status, search } = req.query;
    const pagination = parsePagination(req.query, { page: 1, limit: 20 });

    // For admin, we need to use a different method that doesn't require userId
    const orders = await listAllOrdersPaginated({
      page: pagination.page,
      limit: pagination.limit,
      status: status as string | undefined,
      search: search as string | undefined,
    });

    return sendJSON(res, 200, orders);
  } catch (error) {
    next(error);
  }
}

// Helper function to list all orders (for admin)
async function listAllOrdersPaginated(options: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const where: Record<string, any> = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.search) {
    where.OR = [
      { orderNumber: { contains: options.search } },
      { fullName: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            slug: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  await prisma.$disconnect();

  return {
    data: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      notes: order.notes,
      couponCode: order.couponCode,
      shippingCost: order.shippingCost,
      shippingLabel: order.shippingLabel,
      fullName: order.fullName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      country: order.country,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        slug: item.slug,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: item.image,
      })),
      user: order.user,
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            provider: order.payment.provider,
          }
        : null,
    })),
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

// ─────────────────────────────────────────────
// Admin: PATCH /api/admin/orders/:id/status
// ─────────────────────────────────────────────

export async function updateAdminOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError("Status is required.");
    }

    const result = await OrderService.updateOrderStatus(id, status, req.user.id);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Admin: POST /api/admin/orders/:id/paid
// ─────────────────────────────────────────────

export async function markOrderPaidAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;

    const result = await OrderService.markOrderPaid(id, req.user.id);
    return sendJSON(res, 200, result);
  } catch (error) {
    next(error);
  }
}

// Helper for pagination that's used in listOrders
function parsePagination(query: Record<string, any>, defaults: { page: number; limit: number }) {
  const page = Math.max(1, parseInt(query.page as string || String(defaults.page), 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string || String(defaults.limit), 10)));
  return { page, limit, skip: (page - 1) * limit };
}
