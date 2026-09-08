/**
 * Monstore Backend - Category Controller
 *
 * HTTP handlers for category endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import * as CategoryService from "../services/CategoryService.js";
import { sendJSON, sendError } from "../utils/helpers.js";
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await CategoryService.getCategories();

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      image: c.image || null,
      productCount: c.productCount,
      products: c.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        image: p.images[0]?.url ?? null,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return sendJSON(res, 200, data);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/categories/:id
// ─────────────────────────────────────────────

export async function getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      throw new NotFoundError("Category", id);
    }

    return sendJSON(res, 200, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      image: category.image || null,
      productCount: category.productCount,
      products: category.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        image: p.images[0]?.url ?? null,
      })),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/categories/slug/:slug
// ─────────────────────────────────────────────

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const category = await CategoryService.getCategoryBySlug(slug);

    if (!category) {
      throw new NotFoundError("Category", slug);
    }

    return sendJSON(res, 200, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      image: category.image || null,
      productCount: category.productCount,
      products: category.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        image: p.images[0]?.url ?? null,
      })),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/categories
// ─────────────────────────────────────────────

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { name, description, image, parentId } = req.body;

    if (!name) {
      throw new ValidationError("Category name is required.");
    }

    const category = await CategoryService.createCategory({
      name,
      description,
      image,
      parentId: parentId || null,
    });

    return sendJSON(res, 201, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      image: category.image || null,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/categories/:id
// ─────────────────────────────────────────────

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;
    const updates = req.body;

    const category = await CategoryService.updateCategory(id, updates);

    if (!category) {
      throw new NotFoundError("Category", id);
    }

    return sendJSON(res, 200, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      image: category.image || null,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/categories/:id
// ─────────────────────────────────────────────

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;

    const deleted = await CategoryService.deleteCategory(id);

    if (!deleted) {
      throw new NotFoundError("Category", id);
    }

    return sendJSON(res, 200, { message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
}
