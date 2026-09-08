/**
 * Monstore Backend - Admin Controller
 *
 * HTTP handlers for admin dashboard and management endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import { sendJSON, sendError, parsePagination, effectivePrice, discountPercent } from "../utils/helpers.js";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/admin/dashboard
// ─────────────────────────────────────────────

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const prisma = new PrismaClient();

    // Get current date info
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLast30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      revenueLast30Days,
      ordersLast30Days,
      ordersThisMonth,
      revenueThisMonth,
      topProducts,
      recentOrders,
      userGrowthLast30Days,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { isActive: true } }),

      // Total products
      prisma.product.count({ where: { status: "ACTIVE" } }),

      // Total orders
      prisma.order.count(),

      // Total revenue (excluding cancelled)
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED"] } },
      }),

      // Revenue last 30 days
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfLast30Days },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      // Orders last 30 days
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLast30Days },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      // Orders this month
      prisma.order.count({
        where: {
          createdAt: { gte: startOfThisMonth },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      // Revenue this month
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfThisMonth },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      // Top products by revenue
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
        where: {
          order: {
            createdAt: { gte: startOfLast30Days },
            status: { notIn: ["CANCELLED"] },
          },
        },
      }),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: { notIn: ["CANCELLED"] } },
        include: {
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              totalPrice: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // User growth last 30 days
      prisma.user.count({
        where: {
          createdAt: { gte: startOfLast30Days },
          isActive: true,
        },
      }),
    ]);

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        revenueLast30Days: revenueLast30Days._sum.total || 0,
        ordersLast30Days,
        ordersThisMonth,
        revenueThisMonth: revenueThisMonth._sum.total || 0,
        userGrowthLast30Days,
      },
      topProducts: topProducts.map((t) => ({
        productId: t.productId,
        productName: t.productName,
        totalRevenue: t._sum.totalPrice,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
        customer: o.user,
        itemsCount: o.items.length,
        items: o.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
      })),
      period: {
        from: startOfLast30Days.toISOString(),
        to: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/products
// ─────────────────────────────────────────────

export async function listAdminProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const pagination = parsePagination(req.query, { page: 1, limit: 50 });
    const search = req.query.search as string;

    const prisma = new PrismaClient();

    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          variants: {
            take: 5,
          },
          _count: {
            select: { orderItems: true, reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    await prisma.$disconnect();

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      category: p.category,
      brand: p.brand,
      sku: p.sku,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      rating: p.rating,
      reviewCount: p._count.reviews,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || p.name,
      })),
      image: p.images[0]?.url ?? null,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
        isDefault: v.isDefault,
      })),
      orderCount: p._count.orderItems,
      reviewCount: p._count.reviews,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return sendJSON(res, 200, {
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────

export async function listAdminUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const pagination = parsePagination(req.query, { page: 1, limit: 50 });
    const search = req.query.search as string;
    const role = req.query.role as string;

    const prisma = new PrismaClient();

    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: { orders: true, addresses: true, reviews: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    await prisma.$disconnect();

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
      orderCount: u._count.orders,
      addressCount: u._count.addresses,
      reviewCount: u._count.reviews,
    }));

    return sendJSON(res, 200, {
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:id (toggle active, change role)
// ─────────────────────────────────────────────

export async function updateAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;
    const { isActive, role } = req.body;

    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      await prisma.$disconnect();
      throw new NotFoundError("User", id);
    }

    const updates: Record<string, any> = {};
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }
    if (role && ["CUSTOMER", "ADMIN"].includes(role)) {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      await prisma.$disconnect();
      throw new ValidationError("No updates provided.");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      message: "User updated successfully.",
      user: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/sales
// ─────────────────────────────────────────────

export async function getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const days = parseInt(req.query.days as string) || 30;

    const prisma = new PrismaClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalRevenue, totalOrders, averageOrderValue, statusBreakdown, topProducts] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED"] },
        },
      }),

      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED"] },
        },
        _count: true,
      }),

      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate },
        },
      }),

      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { totalPrice: true },
        _count: { orderId: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 10,
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { notIn: ["CANCELLED"] },
          },
        },
      }),
    ]);

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      period: {
        days,
        from: startDate.toISOString(),
        to: new Date().toISOString(),
      },
      summary: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        averageOrderValue:
          totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0,
      },
      statusBreakdown: statusBreakdown.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      topProducts: topProducts.map((t) => ({
        productId: t.productId,
        productName: t.productName,
        totalRevenue: t._sum.totalPrice,
        unitsSold: t._count.orderId,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/revenue (simple revenue summary)
// ─────────────────────────────────────────────

export async function getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const prisma = new PrismaClient();

    const result = await prisma.order.groupBy({
      by: ["paymentStatus"],
      _sum: { total: true },
      _count: { id: true },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, result.map((r) => ({
      paymentStatus: r.paymentStatus,
      totalAmount: r._sum.total || 0,
      ordersCount: r._count.id,
    })));
  } catch (error) {
    next(error);
  }
}
