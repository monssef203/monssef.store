/**
 * MONSTORE — Admin API client.
 *
 * Thin typed wrappers around the EXISTING admin endpoints of the deployed
 * backend (`/api/admin/*`). Authentication is handled by the shared API
 * client (`request` attaches the stored JWT automatically).
 *
 * No endpoint is invented here: every call maps 1:1 to an existing route.
 */

import { request } from "./client";
import type {
  AdminAddress,
  AdminOrder,
  AdminProduct,
  AdminUser,
  DashboardData,
  Paginated,
  RevenueRow,
  SalesData,
} from "../types/admin";

type QueryParams = Record<string, string | number | undefined>;

function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminApi = {
  /**
   * GET /api/admin/dashboard — global statistics.
   */
  dashboard(): Promise<DashboardData> {
    return request<DashboardData>("/admin/dashboard");
  },

  /**
   * GET /api/admin/products — paginated admin product list (+ search).
   */
  products(params?: { page?: number; limit?: number; search?: string }): Promise<Paginated<AdminProduct>> {
    return request<Paginated<AdminProduct>>(`/admin/products${buildQuery(params)}`);
  },

  /**
   * GET /api/admin/orders — paginated admin order list (+ status/search filters).
   */
  orders(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<Paginated<AdminOrder>> {
    return request<Paginated<AdminOrder>>(`/admin/orders${buildQuery(params)}`);
  },

  /**
   * PATCH /api/admin/orders/:id/status — update order status.
   */
  updateOrderStatus(id: string, status: string): Promise<unknown> {
    return request<unknown>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * POST /api/admin/orders/:id/paid — mark an order as paid.
   */
  markOrderPaid(id: string): Promise<unknown> {
    return request<unknown>(`/admin/orders/${id}/paid`, {
      method: "POST",
    });
  },

  /**
   * GET /api/admin/users — paginated admin user list (+ search / role filters).
   */
  users(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<Paginated<AdminUser>> {
    return request<Paginated<AdminUser>>(`/admin/users${buildQuery(params)}`);
  },

  /**
   * PATCH /api/admin/users/:id — update a user (isActive / role).
   */
  updateUser(id: string, data: { isActive?: boolean; role?: string }): Promise<{ message?: string; user?: AdminUser }> {
    return request<{ message?: string; user?: AdminUser }>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /api/admin/sales — sales summary over the last `days` days.
   */
  sales(days = 30): Promise<SalesData> {
    return request<SalesData>(`/admin/sales${days ? `?days=${days}` : ""}`);
  },

  /**
   * GET /api/admin/revenue — revenue grouped by payment status.
   */
  revenue(): Promise<RevenueRow[]> {
    return request<RevenueRow[]>("/admin/revenue");
  },

  /**
   * GET /api/admin/addresses — admin view of customer addresses.
   */
  addresses(): Promise<AdminAddress[] | Paginated<AdminAddress>> {
    return request<AdminAddress[] | Paginated<AdminAddress>>("/admin/addresses");
  },
};
