/**
 * Monstore Backend - Product Controller
 *
 * HTTP handlers for product endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { requireAuth, requireAdmin } from "../middleware/AuthMiddleware.js";
import * as ProductService from "../services/ProductService.js";
import { sendJSON, sendError, parsePagination, buildProductFilters, buildSort, effectivePrice, discountPercent } from "../utils/helpers.js";
import { ValidationError, NotFoundError, ForbiddenError, OutOfStockError } from "../utils/errors.js";

// ─────────────────────────────────────────────
// GET /api/products
// ─────────────────────────────────────────────

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pagination = parsePagination(req.query, { page: 1, limit: 20 });
    const filters = buildProductFilters(req.query);
    const sort = buildSort(req.query.sort as string);

    const result = await ProductService.getProducts({
      where: filters,
      orderBy: sort,
      skip: pagination.skip,
      take: pagination.limit,
    });

    const products = result.products.map((p) => ({
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
      reviewCount: p.reviewCount,
      weight: p.weight,
      dimensions: p.dimensions,
      warranty: p.warranty,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || p.name,
        sortOrder: img.sortOrder,
      })),
      image: p.images[0]?.url ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return sendJSON(res, 200, {
      data: products,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/products/featured
// ─────────────────────────────────────────────

export async function listFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await ProductService.getFeaturedProducts(limit);

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      category: p.category,
      brand: p.brand,
      sku: p.sku,
      stock: p.stock,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || p.name,
      })),
      image: p.images[0]?.url ?? null,
    }));

    return sendJSON(res, 200, data);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────

export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const product = await ProductService.getProductById(id);

    if (!product) {
      throw new NotFoundError("Product", id);
    }

    return sendJSON(res, 200, product);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/products/slug/:slug
// ─────────────────────────────────────────────

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const product = await ProductService.getProductBySlug(slug);

    if (!product) {
      throw new NotFoundError("Product", slug);
    }

    return sendJSON(res, 200, product);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/products
// ─────────────────────────────────────────────

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      brand,
      sku,
      stock,
      isFeatured,
      isNew,
      isBestSeller,
      weight,
      dimensions,
      warranty,
      images,
      variants,
    } = req.body;

    if (!name || !description || !price || !categoryId || !sku) {
      throw new ValidationError("Name, description, price, category, and SKU are required.");
    }

    const product = await ProductService.createProduct({
      name,
      description,
      price,
      discountPrice,
      categoryId,
      brand,
      sku,
      stock: stock ?? 0,
      isFeatured: isFeatured ?? false,
      isNew: isNew ?? false,
      isBestSeller: isBestSeller ?? false,
      weight,
      dimensions,
      warranty,
      images,
      variants,
    });

    return sendJSON(res, 201, product);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/products/:id
// ─────────────────────────────────────────────

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;
    const updates = req.body;

    const product = await ProductService.updateProduct(id, updates);

    if (!product) {
      throw new NotFoundError("Product", id);
    }

    return sendJSON(res, 200, product);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/products/:id
// ─────────────────────────────────────────────

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;

    const deleted = await ProductService.deleteProduct(id);

    if (!deleted) {
      throw new NotFoundError("Product", id);
    }

    return sendJSON(res, 200, { message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/products/related/:productId
// ─────────────────────────────────────────────

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;

    const related = await ProductService.getRelatedProducts(productId, limit);

    const data = related.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      category: p.category,
      brand: p.brand,
      sku: p.sku,
      stock: p.stock,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || p.name,
      })),
      image: p.images[0]?.url ?? null,
    }));

    return sendJSON(res, 200, data);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/products/:id/stock
// ─────────────────────────────────────────────

export async function updateProductStock(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdmin(req, res, next);
    if (!req.user) throw new ForbiddenError("Admin access required.");

    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || typeof stock !== "number" || stock < 0) {
      throw new ValidationError("Stock must be a non-negative number.");
    }

    const product = await ProductService.updateProductStock(id, stock);

    if (!product) {
      throw new NotFoundError("Product", id);
    }

    return sendJSON(res, 200, {
      message: "Stock updated successfully.",
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
      },
    });
  } catch (error) {
    next(error);
  }
}
