/**
 * Monstore Backend - Category Service
 *
 * Business logic for category operations.
 */

import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError, ConflictError } from "../utils/errors.js";
import slugify from "slugify";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Get All Categories
// ─────────────────────────────────────────────

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        take: 4,
        orderBy: { createdAt: "desc" },
        where: { status: "ACTIVE" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return categories;
}

// ─────────────────────────────────────────────
// Get Category by ID
// ─────────────────────────────────────────────

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        take: 8,
        orderBy: { createdAt: "desc" },
        where: { status: "ACTIVE" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return category;
}

// ─────────────────────────────────────────────
// Get Category by Slug
// ─────────────────────────────────────────────

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        take: 8,
        orderBy: { createdAt: "desc" },
        where: { status: "ACTIVE" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return category;
}

// ─────────────────────────────────────────────
// Create Category
// ─────────────────────────────────────────────

export async function createCategory(data: {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
}) {
  // Generate slug from name
  const slug = slugify(data.name, { lower: true, strict: true });

  // Check if slug already exists
  const existingSlug = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new ConflictError("A category with this name already exists.");
  }

  // Check if name already exists (case insensitive)
  const existingName = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existingName) {
    throw new ConflictError("A category with this name already exists.");
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      parentId: data.parentId || null,
      sortOrder: 0,
      isActive: true,
    },
  });

  return category;
}

// ─────────────────────────────────────────────
// Update Category
// ─────────────────────────────────────────────

export async function updateCategory(id: string, data: Record<string, any>) {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Category", id);
  }

  const updateData: Record<string, any> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name, { lower: true, strict: true });

    // Check slug uniqueness
    const slugConflict = await prisma.category.findFirst({
      where: {
        slug: updateData.slug,
        id: { not: id },
      },
    });

    if (slugConflict) {
      throw new ValidationError("This slug is already in use by another category.");
    }
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return category;
}

// ─────────────────────────────────────────────
// Delete Category
// ─────────────────────────────────────────────

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError("Category", id);
  }

  // Check if category has products
  if (existing._count.products > 0) {
    throw new ValidationError(
      `Cannot delete category with ${existing._count.products} product(s). Please reassign or delete them first.`
    );
  }

  // Check if category has children
  if (existing._count.children > 0) {
    throw new ValidationError(
      `Cannot delete category with ${existing._count.children} child category(ies).`
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return true;
}
