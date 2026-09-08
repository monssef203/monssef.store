import { PrismaClient, ProductStatus } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featured?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "best-selling" | "rating";
  brand?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getProducts(params: ProductListParams): Promise<PaginatedResult<any>> {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    categoryId,
    minPrice,
    maxPrice,
    inStockOnly,
    featured,
    sort = "featured",
    brand,
  } = params;

  const where: any = { status: ProductStatus.ACTIVE };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined) {
    where.price = { ...((where.price as object) || {}), gte: minPrice };
  }

  if (maxPrice !== undefined) {
    where.price = { ...((where.price as object) || {}), lte: maxPrice };
  }

  if (inStockOnly) {
    where.stock = { gt: 0 };
  }

  if (featured) {
    where.isFeatured = true;
  }

  if (brand) {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  const orderBy: any = {
    featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    newest: { createdAt: "desc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    "best-selling": [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    rating: [{ rating: "desc" }, { createdAt: "desc" }],
  }[sort] || { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 5, select: { url: true, alt: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discountPrice: p.discountPrice,
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
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    image: p.images[0]?.url || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: { select: { id: true, name: true, value: true, price: true, stock: true, sku: true, isDefault: true } },
      _count: { select: { orderItems: true, reviews: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    stock: product.stock,
    status: product.status,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    rating: product.rating,
    reviewCount: product.reviewCount ?? product._count.reviews,
    weight: product.weight,
    dimensions: product.dimensions,
    warranty: product.warranty,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    image: product.images[0]?.url || null,
    variants: product.variants || [],
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      author: r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() || "Client" : "Client",
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: { select: { id: true, name: true, value: true, price: true, stock: true, sku: true, isDefault: true } },
      _count: { select: { orderItems: true, reviews: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    stock: product.stock,
    status: product.status,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    rating: product.rating,
    reviewCount: product.reviewCount ?? product._count.reviews,
    weight: product.weight,
    dimensions: product.dimensions,
    warranty: product.warranty,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    image: product.images[0]?.url || null,
    variants: product.variants || [],
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      author: r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() || "Client" : "Client",
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function createProduct(data: any, userId: string) {
  if (!data.name?.trim()) throw new Error("Product name is required");
  if (!data.description?.trim()) throw new Error("Product description is required");
  if (!data.price || data.price <= 0) throw new Error("Price must be greater than 0");
  if (!data.categoryId) throw new Error("Category is required");
  if (!data.sku?.trim()) throw new Error("SKU is required");

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new Error("Category not found");

  const slug = slugify(data.name, { lower: true, strict: true });
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) throw new Error("A product with this name already exists");

  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      categoryId: data.categoryId,
      brand: data.brand?.trim() || null,
      sku: data.sku.trim(),
      stock: data.stock ?? 0,
      status: ProductStatus.ACTIVE,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
      isBestSeller: data.isBestSeller ?? false,
      rating: data.rating ?? 0,
      reviewCount: data.reviewCount ?? 0,
      warranty: data.warranty?.trim() || null,
      weight: data.weight ?? null,
      dimensions: data.dimensions?.trim() || null,
    },
  });

  if (data.images?.length) {
    await prisma.productImage.createMany({
      data: data.images.map((img: any, idx: number) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || data.name,
        sortOrder: idx,
      })),
    });
  }

  if (data.variants?.length) {
    await prisma.productVariant.createMany({
      data: data.variants.map((v: any) => ({
        productId: product.id,
        name: v.name,
        value: v.value,
        price: v.price ?? null,
        stock: v.stock ?? 0,
        sku: v.sku ?? null,
        isDefault: v.isDefault ?? false,
      })),
    });
  }

  return prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: true,
    },
  });
}

export async function updateProduct(id: string, data: any) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  const updates: any = {};
  if (data.name?.trim() && data.name.trim() !== existing.name) {
    const newSlug = slugify(data.name, { lower: true, strict: true });
    updates.name = data.name.trim();
    updates.slug = newSlug;
  }
  if (data.description?.trim() !== undefined) updates.description = data.description?.trim();
  if (data.price !== undefined) updates.price = data.price;
  if (data.discountPrice !== undefined) updates.discountPrice = data.discountPrice;
  if (data.categoryId) updates.categoryId = data.categoryId;
  if (data.brand !== undefined) updates.brand = data.brand?.trim() || null;
  if (data.sku?.trim() !== undefined) updates.sku = data.sku.trim();
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
  if (data.isNew !== undefined) updates.isNew = data.isNew;
  if (data.isBestSeller !== undefined) updates.isBestSeller = data.isBestSeller;
  if (data.weight !== undefined) updates.weight = data.weight;
  if (data.dimensions !== undefined) updates.dimensions = data.dimensions?.trim() || null;
  if (data.warranty !== undefined) updates.warranty = data.warranty?.trim() || null;

  const product = await prisma.product.update({
    where: { id },
    data: updates,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: true,
    },
  });

  if (data.images?.length) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: data.images.map((img: any, idx: number) => ({
        productId: id,
        url: img.url,
        alt: img.alt || product.name,
        sortOrder: idx,
      })),
    });
  }

  if (data.variants?.length && data.replaceVariants !== false) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.productVariant.createMany({
      data: data.variants.map((v: any) => ({
        productId: id,
        name: v.name,
        value: v.value,
        price: v.price ?? null,
        stock: v.stock ?? 0,
        sku: v.sku ?? null,
        isDefault: v.isDefault ?? false,
      })),
    });
  }

  return prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: true,
    },
  });
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");
  await prisma.product.delete({ where: { id } });
  return { message: "Product deleted successfully", id };
}

export async function getFeaturedProducts(limit: number = 12) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discountPrice: p.discountPrice,
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
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    image: p.images[0]?.url || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getRelatedProducts(productId: string, limit: number = 4) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { categoryId: true, brand: true } });
  if (!product) return [];

  const related = await prisma.product.findMany({
    where: {
      id: { not: productId },
      status: ProductStatus.ACTIVE,
      OR: [{ categoryId: product.categoryId }, { brand: product.brand }],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });

  return related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discountPrice: p.discountPrice,
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
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    image: p.images[0]?.url || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

export async function updateStock(id: string, data: { stock?: number; adjust?: number }) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  let newStock: number;
  if (data.adjust !== undefined) {
    newStock = Math.max(0, existing.stock + data.adjust);
  } else {
    newStock = data.stock ?? existing.stock;
  }

  const product = await prisma.product.update({
    where: { id },
    data: { stock: newStock },
    select: { id: true, name: true, stock: true, sku: true },
  });

  return {
    message: `Stock updated to ${newStock}`,
    product,
  };
}
