/**
 * Monstore Backend - Product Image Controller
 *
 * HTTP handlers for product image endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import { sendJSON, sendError } from "../utils/helpers.js";
import { PrismaClient } from "@prisma/client";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/products/:productId/images
// ─────────────────────────────────────────────

export async function getProductImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.params;

    const prisma = new PrismaClient();

    // Check product exists (anyone can view images of existing products)
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      await prisma.$disconnect();
      throw new NotFoundError("Product", productId);
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, images.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      alt: img.alt || product.name,
      sortOrder: img.sortOrder,
      createdAt: img.createdAt.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/products/:productId/images
// ─────────────────────────────────────────────

export async function createProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { productId } = req.params;
    const { url, alt, sortOrder } = req.body;

    if (!url) {
      throw new ValidationError("Image URL is required.");
    }

    const prisma = new PrismaClient();

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      await prisma.$disconnect();
      throw new NotFoundError("Product", productId);
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        alt: alt || product.name,
        sortOrder: sortOrder || 0,
      },
      include: {
        product: {
          select: { name: true },
        },
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 201, {
      id: image.id,
      productId: image.productId,
      url: image.url,
      alt: image.alt || product.name,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/products/:productId/images/:imageId
// ─────────────────────────────────────────────

export async function updateProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { productId, imageId } = req.params;
    const { url, alt, sortOrder } = req.body;

    const prisma = new PrismaClient();

    // Check image exists and belongs to product
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
      include: {
        product: {
          select: { name: true },
        },
      },
    });

    if (!image) {
      await prisma.$disconnect();
      throw new NotFoundError("Image", imageId);
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: url || image.url,
        alt: alt !== undefined ? alt : image.alt,
        sortOrder: sortOrder !== undefined ? sortOrder : image.sortOrder,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      id: updated.id,
      productId: updated.productId,
      url: updated.url,
      alt: updated.alt || image.product.name,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/products/:productId/images/:imageId
// ─────────────────────────────────────────────

export async function deleteProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { productId, imageId } = req.params;

    const prisma = new PrismaClient();

    // Check image exists and belongs to product
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      await prisma.$disconnect();
      throw new NotFoundError("Image", imageId);
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, { message: "Image deleted successfully." });
  } catch (error) {
    next(error);
  }
}
