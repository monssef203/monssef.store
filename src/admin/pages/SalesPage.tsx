/**
 * MONSTORE — Admin Sales (/admin/sales).
 * Connects to GET /api/admin/sales?days=N and displays the real data:
 * period summary, status breakdown and top products.
 */

import { useState } from "react";
import { BarChart3, RefreshCw, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useFetch } from "../hooks";
import { Button, Card, EmptyState, ErrorState, PageHeader, StatCard, StatGridSkeleton, TableSkeleton } from "../ui";
import { cn } from "../../utils/cn";
import { formatDate, formatMoney, formatNumber, getApiErrorMessage, metaFor, ORDER_STATUS_META, ORDER_STATUSES } from "../lib";

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default function SalesPage() {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useFetch(() => adminApi.sales(days), [days]);

  const statusBreakdown = data?.statusBreakdown ?? {};
  const orderedStatuses = ORDER_STATUSES.filter((s) => (statusBreakdown[s] ?? 0) > 0);
  const totalInBreakdown = Object.values(statusBreakdown).reduce((sum, value) => sum + Number(value ?? 0), 0);
  const totalOrders = Number(data?.summary?.totalOrders ?? 0);
  const topProducts = data?.topProducts ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle={
          data?.period ? `Sales for the last ${data.period.days ?? days} days` : "Sales overview"
        }
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-neutral-300 bg-white p-1 shadow-sm" role="group" aria-label="Sales period">
              {PERIODS.map((period) => (
                <button
                  key={period.days}
                  type="button"
                  onClick={() => setDays(period.days)}
                  aria-pressed={days === period.days}
                  className={cn(
                    "tap-scale rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    days === period.days
                      ? "bg-[var(--color-ink)] text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-[var(--color-ink)]"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh sales">
              <RefreshCw className="h-4 w-4" aria-hidden />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </>
        }
      />

      {error && !data ? (
        <ErrorState title="Could not load sales" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <>
          <StatGridSkeleton count={3} />
          <TableSkeleton rows={6} cells={3} />
        </>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Revenue"
              value={formatMoney(data.summary?.totalRevenue)}
              sub={data.period ? `${formatDate(data.period.from)} → ${formatDate(data.period.to)}` : undefined}
            />
            <StatCard
              icon={ShoppingBag}
              label="Orders"
              value={formatNumber(data.summary?.totalOrders)}
              sub="Orders placed in the period"
            />
            <StatCard
              icon={BarChart3}
              label="Average order value"
              value={formatMoney(data.summary?.averageOrderValue, 2)}
              sub="Revenue ÷ orders"
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
            {/* Status breakdown */}
            <Card className="overflow-hidden xl:col-span-2">
              <div className="border-b border-neutral-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-[var(--color-ink)]">Orders by status</h2>
                <p className="text-xs text-neutral-400">Distribution of orders in the selected period</p>
              </div>
              {totalInBreakdown === 0 ? (
                <EmptyState
                  compact
                  icon={Sparkles}
                  title="No orders in this period"
                  description="Orders placed in the selected window will be broken down here."
                />
              ) : (
                <ul className="divide-y divide-neutral-50">
                  {orderedStatuses.map((status) => {
                    const count = Number(statusBreakdown[status] ?? 0);
                    const share = totalInBreakdown > 0 ? (count / totalInBreakdown) * 100 : 0;
                    const meta = metaFor(ORDER_STATUS_META, status);
                    return (
                      <li key={status} className="px-5 py-3.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-neutral-700">{meta.label}</span>
                          <span className="tabular-nums text-neutral-500">
                            {formatNumber(count)}
                            <span className="ml-2 text-xs text-neutral-400">({share.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-[var(--color-gold)]"
                            style={{ width: `${Math.max(share, share > 0 ? 3 : 0)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                  <li className="flex items-center justify-between bg-neutral-50/60 px-5 py-3 text-sm font-semibold text-[var(--color-ink)]">
                    <span>Total</span>
                    <span className="tabular-nums">{formatNumber(totalInBreakdown)}</span>
                  </li>
                </ul>
              )}
            </Card>

            {/* Top products */}
            <Card className="overflow-hidden xl:col-span-3">
              <div className="border-b border-neutral-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-[var(--color-ink)]">Top products</h2>
                <p className="text-xs text-neutral-400">By revenue in the selected period</p>
              </div>
              {topProducts.length === 0 ? (
                <EmptyState
                  compact
                  icon={Sparkles}
                  title="No product sales yet"
                  description="Best-selling products for this period will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                        <th scope="col" className="px-5 py-3 font-semibold">#</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold">Orders</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => {
                        const revenue = Number(product.totalRevenue ?? 0);
                        const maxRevenue = Math.max(...topProducts.map((p) => Number(p.totalRevenue ?? 0)), 1);
                        const share = Math.max(revenue > 0 ? (revenue / maxRevenue) * 100 : 0, revenue > 0 ? 4 : 0);
                        return (
                          <tr key={product.productId ?? product.productName ?? index} className="border-b border-neutral-50 last:border-0">
                            <td className="px-5 py-3.5">
                              <span className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                                index < 3 ? "bg-[var(--color-sand)] text-[#7c5a28]" : "bg-neutral-100 text-neutral-500"
                              )}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-[var(--color-ink)]">{product.productName ?? "Unknown product"}</p>
                              <div className="mt-1.5 h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-neutral-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)]"
                                  style={{ width: `${share}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right tabular-nums text-neutral-500">
                              {formatNumber(product.unitsSold)}
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-[var(--color-ink)] tabular-nums">
                              {formatMoney(revenue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {totalOrders === 0 && (
            <Card className="p-4">
              <p className="text-center text-xs text-neutral-400">
                No orders were recorded for the selected period — all values above are zero.
              </p>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
