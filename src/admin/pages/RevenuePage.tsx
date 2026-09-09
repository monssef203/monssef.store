/**
 * MONSTORE — Admin Revenue (/admin/revenue).
 * Connects to GET /api/admin/revenue — revenue grouped by payment status.
 */

import { Banknote, CheckCircle2, CircleAlert, Receipt, RefreshCw, RotateCcw, Wallet, type LucideIcon } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useFetch } from "../hooks";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, StatCard, StatGridSkeleton } from "../ui";
import { formatMoney, formatNumber, getApiErrorMessage, humanizeStatus, metaFor, PAYMENT_STATUS_META } from "../lib";
import type { RevenueRow } from "../../types/admin";

const STATUS_ICONS: Record<string, LucideIcon> = {
  PAID: CheckCircle2,
  PENDING: CircleAlert,
  FAILED: CircleAlert,
  REFUNDED: RotateCcw,
};

function normalizeRows(raw: RevenueRow[] | { data?: RevenueRow[] } | null | undefined): RevenueRow[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  return [];
}

export default function RevenuePage() {
  const { data, loading, error, reload } = useFetch(() => adminApi.revenue(), []);
  const rows = normalizeRows(data);
  const grandTotal = rows.reduce((sum, row) => sum + Number(row.totalAmount ?? 0), 0);
  const grandOrders = rows.reduce((sum, row) => sum + Number(row.ordersCount ?? 0), 0);
  const maxAmount = Math.max(...rows.map((row) => Number(row.totalAmount ?? 0)), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Revenue grouped by payment status — as returned by the API."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh revenue">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      {error && !data ? (
        <ErrorState title="Could not load revenue" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <>
          <StatGridSkeleton count={3} />
          <Card className="p-6">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-neutral-200/60" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-200/60" />
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard icon={Wallet} label="Total revenue" value={formatMoney(grandTotal, 2)} sub="Across all payment statuses" />
            <StatCard icon={Receipt} label="Orders" value={formatNumber(grandOrders)} sub="Included in this breakdown" />
            <StatCard
              icon={CheckCircle2}
              label="Collected (paid)"
              value={formatMoney(rows.find((row) => row.paymentStatus === "PAID")?.totalAmount ?? null, 2)}
              sub="Orders that have been paid"
            />
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-ink)]">Breakdown by payment status</h2>
                <p className="text-xs text-neutral-400">Share of total revenue for every status reported by the backend</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {rows.map((row) => (
                  <Badge key={row.paymentStatus ?? "unknown"} tone={metaFor(PAYMENT_STATUS_META, row.paymentStatus).tone} dot>
                    {humanizeStatus(row.paymentStatus)}
                  </Badge>
                ))}
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                compact
                icon={Banknote}
                title="No revenue data"
                description="The revenue endpoint returned no rows — no orders exist yet."
              />
            ) : (
              <ul className="divide-y divide-neutral-50">
                {rows.map((row) => {
                  const amount = Number(row.totalAmount ?? 0);
                  const ordersCount = Number(row.ordersCount ?? 0);
                  const share = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
                  const meta = metaFor(PAYMENT_STATUS_META, row.paymentStatus);
                  const Icon = STATUS_ICONS[row.paymentStatus ?? ""] ?? Banknote;
                  return (
                    <li key={row.paymentStatus ?? "unknown"} className="px-5 py-4 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-ink)]">{meta.label}</p>
                            <p className="text-xs text-neutral-400">{formatNumber(ordersCount)} order{ordersCount === 1 ? "" : "s"}</p>
                          </div>
                        </div>
                        <div className="sm:w-64">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-400">Share</span>
                            <span className="tabular-nums text-neutral-500">{share.toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-[var(--color-gold)]"
                              style={{ width: `${Math.max(amount > 0 ? (amount / maxAmount) * 100 : 0, amount > 0 ? 6 : 0)}%` }}
                            />
                          </div>
                        </div>
                        <p className="shrink-0 text-right text-base font-semibold text-[var(--color-ink)] tabular-nums">
                          {formatMoney(amount, 2)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
