import { Response } from "express";

/**
 * Send a JSON error response
 */
export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  const body: Record<string, unknown> = { error: message, code };
  if (details) body.details = details;
  return res.status(status).json(body);
}

/**
 * Send a JSON success response
 */
export function sendJSON<T>(res: Response, status: number, data: T) {
  return res.status(status).json(data);
}

/**
 * Send a 204 No Content response
 */
export function sendNoContent(res: Response) {
  return res.status(204).send();
}

/**
 * Parse pagination parameters
 */
export function parsePagination(query: Record<string, any>, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, parseInt(query.page as string || String(defaults.page), 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string || String(defaults.limit), 10)));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Build sort order from query parameter
 */
export function buildSort(sort: string | undefined): Record<string, string> {
  const sortMap: Record<string, Record<string, string>> = {
    featured: { isFeatured: "desc" },
    newest: { createdAt: "desc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    "best-selling": { isBestSeller: "desc" },
    rating: { rating: "desc" },
  };
  return sortMap[sort || ""] || { createdAt: "desc" };
}

/**
 * Build filter object from query parameters
 */
export function buildFilters(query: Record<string, any>) {
  const filters: Record<string, any> = {};

  if (query.search) {
    filters.search = query.search;
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.categoryId) {
    filters.categoryId = query.categoryId;
  }

  if (query.minPrice) {
    filters.minPrice = parseFloat(query.minPrice);
  }

  if (query.maxPrice) {
    filters.maxPrice = parseFloat(query.maxPrice);
  }

  if (query.inStock === "true") {
    filters.inStockOnly = true;
  }

  if (query.featured === "true") {
    filters.featured = true;
  }

  if (query.brand) {
    filters.brand = query.brand;
  }

  return filters;
}

/**
 * Compute effective price (discount price if available)
 */
export function effectivePrice(product: { price: number; discountPrice?: number | null }): number {
  if (product.discountPrice && product.discountPrice > 0) {
    return product.discountPrice;
  }
  return product.price;
}

/**
 * Calculate discount percentage
 */
export function discountPercent(product: { price: number; discountPrice?: number | null }): number {
  if (!product.discountPrice || product.discountPrice <= 0 || product.price <= 0) {
    return 0;
  }
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}

/**
 * Calculate shipping cost based on subtotal
 */
export function shippingCost(subtotal: number, freeThreshold = 1500, cost = 30): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= freeThreshold) return 0;
  return cost;
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MS-${timestamp}-${random}`;
}

/**
 * Generate slug from name
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validate Moroccan phone number
 */
export function isValidMoroccanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "");
  // 06, 05, 07 followed by 8 digits, or +212/212 followed by 9 digits
  const localPattern = /^0[5-7]\d{8}$/;
  const intlPattern = /^(?:[\+]?212|212)\d{9}$/;
  return localPattern.test(cleaned) || intlPattern.test(cleaned);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML (basic)
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
