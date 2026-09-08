/**
 * Monstore Backend - Address Controller
 *
 * HTTP handlers for address endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import { sendJSON, sendError, parsePagination, isValidMoroccanPhone } from "../utils/helpers.js";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/addresses
// ─────────────────────────────────────────────

export async function listAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const prisma = new PrismaClient();

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, addresses.map((a) => ({
      id: a.id,
      userId: a.userId,
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      city: a.city,
      address: a.address,
      country: a.country,
      isDefault: a.isDefault,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/addresses/:id
// ─────────────────────────────────────────────

export async function getAddressById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const prisma = new PrismaClient();

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    await prisma.$disconnect();

    if (!address) {
      throw new NotFoundError("Address", id);
    }

    return sendJSON(res, 200, {
      id: address.id,
      userId: address.userId,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      address: address.address,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/addresses
// ─────────────────────────────────────────────

export async function createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const {
      label,
      fullName,
      phone,
      city,
      address,
      country,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !city || !address) {
      throw new ValidationError("Full name, phone, city, and address are required.");
    }

    if (!isValidMoroccanPhone(phone)) {
      throw new ValidationError("Invalid phone number.");
    }

    const prisma = new PrismaClient();

    // If this is the default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: label || null,
        fullName,
        phone,
        city,
        address,
        country: country || "MA",
        isDefault: isDefault || false,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 201, {
      id: newAddress.id,
      userId: newAddress.userId,
      label: newAddress.label,
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      city: newAddress.city,
      address: newAddress.address,
      country: newAddress.country,
      isDefault: newAddress.isDefault,
      createdAt: newAddress.createdAt.toISOString(),
      updatedAt: newAddress.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/addresses/:id
// ─────────────────────────────────────────────

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;
    const {
      label,
      fullName,
      phone,
      city,
      address,
      country,
      isDefault,
    } = req.body;

    const prisma = new PrismaClient();

    // Check address exists and belongs to user
    const existing = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      await prisma.$disconnect();
      throw new NotFoundError("Address", id);
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        label: label !== undefined ? label : existing.label,
        fullName: fullName || existing.fullName,
        phone: phone || existing.phone,
        city: city || existing.city,
        address: address || existing.address,
        country: country || existing.country,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      id: updated.id,
      userId: updated.userId,
      label: updated.label,
      fullName: updated.fullName,
      phone: updated.phone,
      city: updated.city,
      address: updated.address,
      country: updated.country,
      isDefault: updated.isDefault,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/addresses/:id
// ─────────────────────────────────────────────

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const prisma = new PrismaClient();

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      await prisma.$disconnect();
      throw new NotFoundError("Address", id);
    }

    await prisma.address.delete({
      where: { id },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, { message: "Address deleted successfully." });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// Admin: GET /api/admin/addresses
// ─────────────────────────────────────────────

export async function listAdminAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const pagination = parsePagination(req.query, { page: 1, limit: 100 });
    const userId = req.query.userId as string;
    const search = req.query.search as string;

    const prisma = new PrismaClient();

    const where: Record<string, any> = {};
    if (userId) {
      where.userId = userId;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [addresses, total] = await Promise.all([
      prisma.address.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
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
      prisma.address.count({ where }),
    ]);

    await prisma.$disconnect();

    const data = addresses.map((a) => ({
      id: a.id,
      userId: a.userId,
      user: a.user,
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      city: a.city,
      address: a.address,
      country: a.country,
      isDefault: a.isDefault,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
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
