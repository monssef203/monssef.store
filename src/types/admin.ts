/**
 * MONSTORE — Admin frontend types.
 *
 * These mirror the documented response shapes of the existing admin API
 * (`/api/admin/*`). Field types are deliberately tolerant (optional, union)
 * so the UI stays robust even if a field is absent in a given deployment.
 */

export interface AdminCategoryInfo {
  id?: string;
  name?: string;
  slug?: string;
}

export interface AdminProductImage {
  id?: string;
  url: string;
  alt?: string | null;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  category?: AdminCategoryInfo | string | null;
  brand?: string | null;
  sku?: string | null;
  stock?: number | null;
  status?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number | null;
  reviewCount?: number;
  images?: AdminProductImage[];
  image?: string | null;
  orderCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOrderUser {
  id?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface AdminOrderItem {
  id?: string;
  productId?: string;
  productName?: string;
  slug?: string | null;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  image?: string | null;
}

export interface AdminPaymentRef {
  id?: string;
  status?: string;
  provider?: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number | null;
  shipping?: number | null;
  total?: number | null;
  notes?: string | null;
  couponCode?: string | null;
  shippingCost?: number | null;
  shippingLabel?: string | null;
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  country?: string;
  itemsCount?: number;
  items?: AdminOrderItem[];
  user?: AdminOrderUser | null;
  /** Dashboard recent orders expose the customer under this key. */
  customer?: AdminOrderUser | null;
  payment?: AdminPaymentRef | null;
  createdAt?: string;
  updatedAt?: string;
  /** Local UI-only transient state — never part of the API contract. */
  _pendingStatus?: string;
  _flashError?: string;
}

export interface AdminUser {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
  orderCount?: number;
  addressCount?: number;
  reviewCount?: number;
}

export interface AdminAddress {
  id?: string;
  userId?: string;
  label?: string | null;
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  country?: string;
  isDefault?: boolean;
  email?: string;
  user?: AdminOrderUser | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta?: PaginationMeta;
}

export interface DashboardData {
  summary?: {
    totalUsers?: number;
    totalProducts?: number;
    totalOrders?: number;
    totalRevenue?: number | null;
    revenueLast30Days?: number | null;
    ordersLast30Days?: number;
    ordersThisMonth?: number;
    revenueThisMonth?: number | null;
    userGrowthLast30Days?: number;
    [key: string]: number | null | undefined;
  } | null;
  topProducts?: Array<{
    productId?: string;
    productName?: string;
    totalRevenue?: number | null;
  }> | null;
  recentOrders?: AdminOrder[] | null;
  period?: { from?: string; to?: string; days?: number } | null;
}

export interface SalesData {
  period?: { days?: number; from?: string; to?: string } | null;
  summary?: {
    totalRevenue?: number | null;
    totalOrders?: number;
    averageOrderValue?: number | null;
  } | null;
  statusBreakdown?: Record<string, number> | null;
  topProducts?: Array<{
    productId?: string;
    productName?: string;
    totalRevenue?: number | null;
    unitsSold?: number | null;
  }> | null;
}

export interface RevenueRow {
  paymentStatus?: string;
  totalAmount?: number | null;
  ordersCount?: number;
}
