/**
 * Monstore Backend - Shared API Types
 *
 * These types are shared between the backend and can be used
 * to generate frontend types via code generation if needed.
 */

// ─────────────────────────────────────────────
// Common API Response Types
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

export interface LoginResponse {
  message: string;
  user: UserPublic;
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
  user: UserPublic;
  accessToken: string;
}

// ─────────────────────────────────────────────
// Product Types
// ─────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
  sku?: string;
  isDefault: boolean;
}

export interface ProductList {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  category: { id: string; name: string; slug: string };
  brand?: string;
  sku: string;
  stock: number;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  weight?: number;
  dimensions?: string;
  warranty?: string;
  images: ProductImage[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends ProductList {
  description: string;
  variants?: ProductVariant[];
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    author?: string;
    createdAt: string;
  }>;
}

// ─────────────────────────────────────────────
// Category Types
// ─────────────────────────────────────────────

export interface CategoryList {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    image?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDetail extends CategoryList {
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

// ─────────────────────────────────────────────
// Cart Types
// ─────────────────────────────────────────────

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    price: number; // effective price
    stock: number;
    status: string;
    isFeatured: boolean;
    images: Array<{ url: string; alt?: string }>;
    image?: string;
    brand?: string;
    rating: number;
  };
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Order Types
// ─────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
  paymentStatus: string;
  paymentMethod: string;
  couponCode?: string;
  shippingCost: number;
  shippingLabel?: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payment?: {
    id: string;
    status: string;
    provider?: string;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// ─────────────────────────────────────────────
// Address Types
// ─────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label?: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Review Types
// ─────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment?: string;
  author?: string;
  createdAt: string;
}

export interface ReviewWithProduct extends Review {
  product: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
}

// ─────────────────────────────────────────────
// Admin Types
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueLast30Days: number;
  ordersLast30Days: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalRevenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    paymentStatus: string;
    createdAt: string;
    customer: { id: string; email: string; firstName?: string; lastName?: string };
    itemsCount: number;
  }>;
  userGrowthLast30Days: number;
}

export interface AdminOrder extends OrderResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  orderCount: number;
  addressCount: number;
  reviewCount: number;
}
