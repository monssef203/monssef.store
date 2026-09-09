/**
 * MONSTORE — Admin helpers: formatting, status metadata and error handling.
 */

import { ApiError } from "../api/client";
import type { Tone } from "./ui";

export const CURRENCY = "DH";

/** Format an amount as money. Renders "—" for missing/invalid values. */
export function formatMoney(value: number | null | undefined, decimals?: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const digits = decimals ?? (Number.isInteger(n) ? 0 : 2);
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${formatted} ${CURRENCY}`;
}

/** Format a plain count. */
export function formatNumber(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US");
}

/** Format an ISO date for display. */
export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Build avatar initials from a name (falls back to email). */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/** Combine first/last name with an email fallback. */
export function personName(first?: string | null, last?: string | null, email?: string | null, fallback = "—"): string {
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || email?.trim() || fallback;
}

/** Humanize an UPPER_SNAKE or UPPER status value ("PENDING_PAYMENT" → "Pending payment"). */
export function humanizeStatus(value?: string | null): string {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  PENDING: { label: "Pending", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "sky" },
  PROCESSING: { label: "Processing", tone: "violet" },
  SHIPPED: { label: "Shipped", tone: "cyan" },
  DELIVERED: { label: "Delivered", tone: "emerald" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};

export const PAYMENT_STATUS_META: Record<string, StatusMeta> = {
  PENDING: { label: "Payment pending", tone: "amber" },
  PAID: { label: "Paid", tone: "emerald" },
  FAILED: { label: "Payment failed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export const PRODUCT_STATUS_META: Record<string, StatusMeta> = {
  ACTIVE: { label: "Active", tone: "emerald" },
  INACTIVE: { label: "Inactive", tone: "neutral" },
  DRAFT: { label: "Draft", tone: "neutral" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
};

export const ROLE_META: Record<string, StatusMeta> = {
  ADMIN: { label: "Admin", tone: "gold" },
  CUSTOMER: { label: "Customer", tone: "neutral" },
};

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export const USER_ROLES = ["CUSTOMER", "ADMIN"];

/** Look up metadata for a value, with a safe fallback. */
export function metaFor(table: Record<string, StatusMeta>, value?: string | null): StatusMeta {
  if (value && table[value]) return table[value];
  return { label: humanizeStatus(value), tone: "neutral" };
}

/** Extract a readable message from any thrown value (fetch / ApiError / network). */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data as { message?: string; error?: string; details?: unknown } | string | null | undefined;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.error === "string" && data.error.trim()) return data.error;
    }
    switch (error.status) {
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      default:
        if (error.status >= 500) return "The server encountered an error. Please try again later.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    if (/failed to fetch|networkerror|load failed|fetch is not defined/i.test(error.message)) {
      return "Cannot reach the server. Please check your connection and try again.";
    }
    if (/unexpected token|<!doctype html/i.test(error.message)) {
      return "The API returned an unexpected response. Make sure VITE_API_BASE_URL points to the MONSTORE API.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

/** True when the error means the stored session is invalid / not allowed. */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}
