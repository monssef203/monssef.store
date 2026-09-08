/**
 * MONSTORE API Client
 *
 * A lightweight fetch-based API client for the backend.
 * All endpoints are relative to the API base URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("monstore_token");
}

// Helper to set auth token
function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("monstore_token", token);
  } else {
    localStorage.removeItem("monstore_token");
  }
}

// Helper to clear auth token (logout)
export function clearAuth(): void {
  setAuthToken(null);
  localStorage.removeItem("monstore_user");
}

// Helper to get current user from localStorage
export function getCurrentUser(): { id: string; email: string; firstName?: string; lastName?: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("monstore_user");
  return user ? JSON.parse(user) : null;
}

// Helper to save current user
export function saveCurrentUser(user: { id: string; email: string; firstName?: string; lastName?: string; role: string }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("monstore_user", JSON.stringify(user));
}

// Standard error handling
function handleResponse<T>(res: Response): T {
  if (!res.ok) {
    const error = res.status === 204 ? null : res.headers.get("content-type")?.includes("json")
      ? res.json()
      : res.text();
    throw new ApiError(res.status, res.statusText, error);
  }
  // Handle 204 No Content
  if (res.status === 204) {
    return null as T;
  }
  return res.json();
}

// Custom error class
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// API request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const token = auth ? getAuthToken() : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(res);
}

// -------------------------------------------------------
// Auth endpoints
// -------------------------------------------------------

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
    const res = await request<{
      message: string;
      user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; role: string; isActive: boolean; createdAt: string };
      accessToken: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }, false);

    // Save token and user
    setAuthToken(res.accessToken);
    saveCurrentUser(res.user);

    return res;
  },

  /**
   * Login
   */
  async login(data: { email: string; password: string }) {
    const res = await request<{
      message: string;
      user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; role: string; isActive: boolean; createdAt: string };
      accessToken: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }, false);

    // Save token and user
    setAuthToken(res.accessToken);
    saveCurrentUser(res.user);

    return res;
  },

  /**
   * Logout (client-side, but we call API to be clean)
   */
  async logout() {
    await request("/auth/logout", { method: "POST" });
    clearAuth();
  },

  /**
   * Get current user
   */
  async me() {
    return request<{
      user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; role: string; isActive: boolean; createdAt: string; updatedAt: string };
    }>("/auth/me");
  },

  /**
   * Update profile
   */
  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; email?: string }) {
    return request<{
      message: string;
      user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; role: string; isActive: boolean; createdAt: string; updatedAt: string };
    }>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false);
  },

  /**
   * Reset password
   */
  async resetPassword(data: { token: string; newPassword: string }) {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, false);
  },
};

// -------------------------------------------------------
// Product endpoints
// -------------------------------------------------------

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  async list(params?: {
    page?: number;
    limit?: number;
    sort?: "featured" | "newest" | "price-asc" | "price-desc" | "best-selling";
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    featured?: boolean;
    brand?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.sort) query.set("sort", params.sort);
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.minPrice) query.set("minPrice", String(params.minPrice));
    if (params?.maxPrice) query.set("maxPrice", String(params.maxPrice));
    if (params?.inStockOnly) query.set("inStockOnly", "true");
    if (params?.featured) query.set("featured", "true");
    if (params?.brand) query.set("brand", params.brand);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;
    return request<{
      data: Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        price: number;
        discountPrice: number | null;
        category: { id: string; name: string; slug: string };
        brand: string | null;
        sku: string;
        stock: number;
        status: string;
        isFeatured: boolean;
        isNew: boolean;
        isBestSeller: boolean;
        rating: number;
        reviewCount: number;
        weight: number | null;
        dimensions: string | null;
        warranty: string | null;
        images: Array<{ url: string; alt: string | null }>;
        image: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(endpoint);
  },

  /**
   * Get product by ID
   */
  async getById(id: string) {
    return request<{
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      category: { id: string; name: string; slug: string };
      brand: string | null;
      sku: string;
      stock: number;
      status: string;
      isFeatured: boolean;
      isNew: boolean;
      isBestSeller: boolean;
      rating: number;
      reviewCount: number;
      weight: number | null;
      dimensions: string | null;
      warranty: string | null;
      images: Array<{ url: string; alt: string | null }>;
      image: string | null;
      variants: Array<{
        id: string;
        name: string;
        value: string;
        price: number | null;
        stock: number;
        sku: string | null;
        isDefault: boolean;
      }>;
      createdAt: string;
      updatedAt: string;
    }>(`/products/${id}`);
  },

  /**
   * Get product by slug
   */
  async getBySlug(slug: string) {
    return request<{
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      category: { id: string; name: string; slug: string };
      brand: string | null;
      sku: string;
      stock: number;
      status: string;
      isFeatured: boolean;
      isNew: boolean;
      isBestSeller: boolean;
      rating: number;
      reviewCount: number;
      weight: number | null;
      dimensions: string | null;
      warranty: string | null;
      images: Array<{ url: string; alt: string | null }>;
      image: string | null;
      variants: Array<{
        id: string;
        name: string;
        value: string;
        price: number | null;
        stock: number;
        sku: string | null;
        isDefault: boolean;
      }>;
      createdAt: string;
      updatedAt: string;
    }>(`/products/slug/${slug}`);
  },

  /**
   * Get featured products
   */
  async getFeatured(limit = 10) {
    return request<Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      category: { id: string; name: string; slug: string };
      brand: string | null;
      sku: string;
      stock: number;
      status: string;
      isFeatured: boolean;
      isNew: boolean;
      isBestSeller: boolean;
      rating: number;
      reviewCount: number;
      weight: number | null;
      dimensions: string | null;
      warranty: string | null;
      images: Array<{ url: string; alt: string | null }>;
      image: string | null;
      createdAt: string;
      updatedAt: string;
    }>>(`/products/featured?limit=${limit}`);
  },

  /**
   * Get related products
   */
  async getRelated(productId: string, limit = 4) {
    return request<Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      category: { id: string; name: string; slug: string };
      brand: string | null;
      sku: string;
      stock: number;
      status: string;
      isFeatured: boolean;
      isNew: boolean;
      isBestSeller: boolean;
      rating: number;
      reviewCount: number;
      weight: number | null;
      dimensions: string | null;
      warranty: string | null;
      images: Array<{ url: string; alt: string | null }>;
      image: string | null;
      createdAt: string;
      updatedAt: string;
    }>>(`/products/related/${productId}?limit=${limit}`);
  },
};

// -------------------------------------------------------
// Category endpoints
// -------------------------------------------------------

export const categoriesApi = {
  /**
   * Get all categories
   */
  async list() {
    return request<Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      productCount: number;
      products: Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        discountPrice: number | null;
        image: string | null;
      }>;
      createdAt: string;
      updatedAt: string;
    }>>("/categories");
  },

  /**
   * Get category by ID
   */
  async getById(id: string) {
    return request<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      productCount: number;
      products: Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        discountPrice: number | null;
        image: string | null;
      }>;
      createdAt: string;
      updatedAt: string;
    }>(`/categories/${id}`);
  },
};

// -------------------------------------------------------
// Cart endpoints (server cart for logged-in users)
// -------------------------------------------------------

export const cartApi = {
  /**
   * Get current user's cart
   */
  async get() {
    return request<{
      id: string;
      userId: string;
      items: Array<{
        id: string;
        productId: string;
        quantity: number;
        product: {
          id: string;
          name: string;
          slug: string;
          price: number;
          discountPrice: number | null;
          price: number;
          stock: number;
          status: string;
          isFeatured: boolean;
          images: Array<{ url: string; alt: string | null }>;
          image: string | null;
          brand: string | null;
          rating: number;
        };
      }>;
      subtotal: number;
      shipping: number;
      total: number;
      itemCount: number;
      updatedAt: string;
    }>("/cart");
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity = 1) {
    return request<{
      message: string;
      item: { id: string; productId: string; quantity: number };
      cart: {
        id: string;
        userId: string;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            discountPrice: number | null;
            price: number;
            stock: number;
            status: string;
            isFeatured: boolean;
            images: Array<{ url: string; alt: string | null }>;
            image: string | null;
            brand: string | null;
            rating: number;
          };
        }>;
        subtotal: number;
        shipping: number;
        total: number;
        itemCount: number;
        updatedAt: string;
      };
    }>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number) {
    return request<{
      message: string;
      item: { id: string; productId: string; quantity: number };
      cart: {
        id: string;
        userId: string;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            discountPrice: number | null;
            price: number;
            stock: number;
            status: string;
            isFeatured: boolean;
            images: Array<{ url: string; alt: string | null }>;
            image: string | null;
            brand: string | null;
            rating: number;
          };
        }>;
        subtotal: number;
        shipping: number;
        total: number;
        itemCount: number;
        updatedAt: string;
      };
    }>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    return request<{
      message: string;
      cart: {
        id: string;
        userId: string;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            discountPrice: number | null;
            price: number;
            stock: number;
            status: string;
            isFeatured: boolean;
            images: Array<{ url: string; alt: string | null }>;
            image: string | null;
            brand: string | null;
            rating: number;
          };
        }>;
        subtotal: number;
        shipping: number;
        total: number;
        itemCount: number;
        updatedAt: string;
      };
    }>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  },

  /**
   * Clear cart
   */
  async clear() {
    return request<{
      message: string;
      cart: {
        id: string;
        userId: string;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            discountPrice: number | null;
            price: number;
            stock: number;
            status: string;
            isFeatured: boolean;
            images: Array<{ url: string; alt: string | null }>;
            image: string | null;
            brand: string | null;
            rating: number;
          };
        }>;
        subtotal: number;
        shipping: number;
        total: number;
        itemCount: number;
        updatedAt: string;
      };
    }>("/cart", {
      method: "DELETE",
    });
  },

  /**
   * Merge guest cart into user cart (called on login)
   */
  async merge(guestItems: Array<{ productId: string; quantity: number }>) {
    return request<{
      message: string;
      cart: {
        id: string;
        userId: string;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            discountPrice: number | null;
            price: number;
            stock: number;
            status: string;
            isFeatured: boolean;
            images: Array<{ url: string; alt: string | null }>;
            image: string | null;
            brand: string | null;
            rating: number;
          };
        }>;
        subtotal: number;
        shipping: number;
        total: number;
        itemCount: number;
        updatedAt: string;
      };
    }>("/cart/merge", {
      method: "POST",
      body: JSON.stringify({ items: guestItems }),
    });
  },
};

// -------------------------------------------------------
// Order endpoints
// -------------------------------------------------------

export const ordersApi = {
  /**
   * Create a new order
   */
  async create(data: {
    items: Array<{ productId: string; quantity: number; variantValue?: string; variantPrice?: number }>;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    email?: string;
    notes?: string;
    shippingLabel?: string;
  }) {
    return request<{
      message: string;
      order: {
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        shipping: number;
        total: number;
        couponCode: string | null;
        notes: string | null;
        paymentStatus: string;
        paymentMethod: string;
        shippingCost: number;
        shippingLabel: string | null;
        fullName: string;
        phone: string;
        city: string;
        address: string;
        country: string;
        createdAt: string;
        updatedAt: string;
      };
      items: Array<{
        id: string;
        productId: string;
        productName: string;
        slug: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        image: string | null;
      }>;
      payment: { id: string; status: string; provider: string | null } | null;
    }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user's orders
   */
  async list(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const queryString = query.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ""}`;
    return request<{
      data: Array<{
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        shipping: number;
        total: number;
        notes: string | null;
        paymentStatus: string;
        paymentMethod: string;
        couponCode: string | null;
        shippingCost: number;
        shippingLabel: string | null;
        fullName: string;
        phone: string;
        city: string;
        address: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        items: Array<{
          id: string;
          productId: string;
          productName: string;
          slug: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          image: string | null;
        }>;
        payment: { id: string; status: string; provider: string | null } | null;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(endpoint);
  },

  /**
   * Get order by ID
   */
  async getById(id: string) {
    return request<{
      order: {
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        shipping: number;
        total: number;
        notes: string | null;
        paymentStatus: string;
        paymentMethod: string;
        couponCode: string | null;
        shippingCost: number;
        shippingLabel: string | null;
        fullName: string;
        phone: string;
        city: string;
        address: string;
        country: string;
        createdAt: string;
        updatedAt: string;
        items: Array<{
          id: string;
          productId: string;
          productName: string;
          slug: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          image: string | null;
        }>;
        payment: { id: string; status: string; provider: string | null } | null;
      };
    }>(`/orders/${id}`);
  },

  /**
   * Cancel an order
   */
  async cancel(id: string) {
    return request<{
      message: string;
      order: {
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        shipping: number;
        total: number;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/orders/${id}/cancel`, {
      method: "PATCH",
    });
  },
};

// -------------------------------------------------------
// Address endpoints
// -------------------------------------------------------

export const addressesApi = {
  /**
   * Get current user's addresses
   */
  async list() {
    return request<Array<{
      id: string;
      userId: string;
      label: string | null;
      fullName: string;
      phone: string;
      city: string;
      address: string;
      country: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    }>>("/addresses");
  },

  /**
   * Get address by ID
   */
  async getById(id: string) {
    return request<{
      id: string;
      userId: string;
      label: string | null;
      fullName: string;
      phone: string;
      city: string;
      address: string;
      country: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/addresses/${id}`);
  },

  /**
   * Create address
   */
  async create(data: {
    label?: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    country?: string;
    isDefault?: boolean;
  }) {
    return request<{
      id: string;
      userId: string;
      label: string | null;
      fullName: string;
      phone: string;
      city: string;
      address: string;
      country: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    }>("/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update address
   */
  async update(id: string, data: {
    label?: string;
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
    country?: string;
    isDefault?: boolean;
  }) {
    return request<{
      id: string;
      userId: string;
      label: string | null;
      fullName: string;
      phone: string;
      city: string;
      address: string;
      country: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete address
   */
  async delete(id: string) {
    return request<{ message: string }>(`/addresses/${id}`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------
// Review endpoints
// -------------------------------------------------------

export const reviewsApi = {
  /**
   * Get reviews for a product
   */
  async getByProduct(productId: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const queryString = query.toString();
    const endpoint = `/reviews/product/${productId}${queryString ? `?${queryString}` : ""}`;
    return request<{
      data: Array<{
        id: string;
        productId: string;
        rating: number;
        comment: string | null;
        author: string;
        createdAt: string;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
      productRating: number;
      productReviewCount: number;
    }>(endpoint);
  },

  /**
   * Get current user's reviews
   */
  async getMy() {
    return request<Array<{
      id: string;
      productId: string;
      product: { id: string; name: string; slug: string; image: string | null };
      rating: number;
      comment: string | null;
      createdAt: string;
    }>>("/reviews/my");
  },

  /**
   * Create a review
   */
  async create(data: { productId: string; rating: number; comment?: string }) {
    return request<{
      message: string;
      review: {
        id: string;
        productId: string;
        rating: number;
        comment: string | null;
        author: string;
        createdAt: string;
      };
    }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a review
   */
  async update(id: string, data: { rating?: number; comment?: string }) {
    return request<{
      message: string;
      review: {
        id: string;
        productId: string;
        rating: number;
        comment: string | null;
        createdAt: string;
      };
    }>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a review
   */
  async delete(id: string) {
    return request<{ message: string }>(`/reviews/${id}`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------
// Export everything
// -------------------------------------------------------

export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
  addresses: addressesApi,
  reviews: reviewsApi,
};
