/**
 * Monstore Backend - Review Controller
 *
 * HTTP handlers for review endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import { sendJSON, sendError, parsePagination, sanitizeHtml } from "../utils/helpers.js";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// POST /api/reviews
// ─────────────────────────────────────────────

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      throw new ValidationError("Product ID and rating are required.");
    }

    if (rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5.");
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

    // Check for existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      await prisma.$disconnect();
      throw new ConflictError("You have already reviewed this product.");
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating,
        comment: sanitizeHtml(comment || ""),
      },
    });

    // Update product rating and review count
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: result._avg.rating || 0,
        reviewCount: result._count.id,
      },
    });

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 201, {
      message: "Review submitted successfully.",
      review: {
        id: review.id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        author: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Client"
          : "Client",
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/reviews/product/:productId
// ─────────────────────────────────────────────

export async function getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.params;
    const pagination = parsePagination(req.query, { page: 1, limit: 20 });

    const prisma = new PrismaClient();

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      await prisma.$disconnect();
      throw new NotFoundError("Product", productId);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    await prisma.$disconnect();

    const data = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      rating: r.rating,
      comment: r.comment,
      author: r.user
        ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Client"
        : "Client",
      createdAt: r.createdAt.toISOString(),
    }));

    return sendJSON(res, 200, {
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
      productRating: product.rating,
      productReviewCount: product.reviewCount,
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/reviews/my
// ─────────────────────────────────────────────

export async function getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const prisma = new PrismaClient();

    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      product: {
        id: r.product.id,
        name: r.product.name,
        slug: r.product.slug,
        image: r.product.images[0]?.url || null,
      },
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/reviews/:id
// ─────────────────────────────────────────────

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;
    const { rating, comment } = req.body;

    const prisma = new PrismaClient();

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      await prisma.$disconnect();
      throw new NotFoundError("Review", id);
    }

    if (review.userId !== req.user.id) {
      await prisma.$disconnect();
      throw new ForbiddenError("You can only update your own reviews.");
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        await prisma.$disconnect();
        throw new ValidationError("Rating must be between 1 and 5.");
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: rating !== undefined ? rating : review.rating,
        comment: comment !== undefined ? sanitizeHtml(comment) : review.comment,
      },
    });

    // Update product rating
    const productResult = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: productResult._avg.rating || 0,
        reviewCount: productResult._count.id,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, {
      message: "Review updated successfully.",
      review: {
        id: updated.id,
        productId: updated.productId,
        rating: updated.rating,
        comment: updated.comment,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/reviews/:id
// ─────────────────────────────────────────────

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAuth(req, res, next);
    if (!req.user) throw new ForbiddenError("Authentication required.");

    const { id } = req.params;

    const prisma = new PrismaClient();

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      await prisma.$disconnect();
      throw new NotFoundError("Review", id);
    }

    // Only owner or admin can delete
    if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
      await prisma.$disconnect();
      throw new ForbiddenError("You can only delete your own reviews.");
    }

    const productId = review.productId;

    await prisma.review.delete({
      where: { id },
    });

    // Update product rating
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: result._avg.rating || 0,
        reviewCount: result._count.id,
      },
    });

    await prisma.$disconnect();

    return sendJSON(res, 200, { message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
}
