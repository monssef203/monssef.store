/**
 * MONSTORE — Admin Dashboard (/admin).
 * Connects to GET /api/admin/dashboard and renders the real statistics
 * returned by the backend.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Coins, Package, ShoppingBag, Sparkles, TrendingUp, Users, Wallet } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useFetch } from "../hooks";
import {
  Badge,
  Button,
  buttonClasses,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatCard,
  StatGridSkeleton,
} from "../ui";
import {
  formatDate,
  formatMoney,
  formatNumber,
  getApiErrorMessage,
  metaFor,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  personName,
} from "../lib";
import type { AdminOrder } from "../../types/admin";

function customerName(order: AdminOrder): string {
  const c = order.customer ?? order.user;
  return personName(c?.firstName, c?.lastName, c?.email, order.fullName || "—");
}

function RecentOrdersTable({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return (
      <EmptyState
        compact
        icon={ShoppingBag}
        title="No orders yet"
        description="When customers place orders they will show up here."
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
            <th scope="col" className="px-5 py-3 font-semibold">Order</th>
            <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Total</th>
            <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = metaFor(ORDER_STATUS_META, order.status);
            const payment = metaFor(PAYMENT_STATUS_META, order.paymentStatus);
            return (
              <tr key={order.id} className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/60">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-[var(--color-ink)]">{order.orderNumber ?? "—"}</p>
                  <p className="text-xs text-neutral-400">{formatDate(order.createdAt, true)}</p>
                </td>
                <td className="max-w-[220px] truncate px-5 py-3.5 text-neutral-600">{customerName(order)}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-[var(--color-ink)] tabular-nums">
                  {formatMoney(order.total)}
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={payment.tone} dot>{payment.label}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={status.tone} dot>{status.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface TopProduct {
  key: string;
  name: string;
  value: number;
}

function getTopProducts(data: { topProducts?: Array<{ productName?: string; totalRevenue?: number | null }> | null } | null): TopProduct[] {
  return (data?.topProducts ?? []).map((p, i) => ({
    key: p.productName ?? `product-${i}`,
    name: p.productName ?? "Unknown product",
    value: Number(p.totalRevenue ?? 0),
  }));
}

function TopProducts({ products }: { products: TopProduct[] }) {
  if (!products.length) {
    return (
      <EmptyState
        compact
        icon={Sparkles}
        title="No top products yet"
        description="Product performance over the last 30 days will appear here."
      />
    );
  }
  const max = Math.max(...products.map((p) => p.value ?? 0), 1);
  return (
    <ul className="divide-y divide-neutral-50">
      {products.map((product, index) => (
        <li key={product.key} className="flex items-center gap-4 px-5 py-3.5">
          <span
            className={index < 3
              ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-sand)] text-xs font-bold text-[#7c5a28]"
              : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-500"}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">{product.name}</p>
              <p className="shrink-0 text-sm font-semibold text-[var(--color-ink)] tabular-nums">{formatMoney(product.value)}</p>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)]"
                style={{ width: `${Math.max(4, ((product.value ?? 0) / max) * 100)}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(), []);
  const summary = data?.summary;

  if (error && !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Overview of store activity." />
        <ErrorState
          title="Could not load the dashboard"
          message={getApiErrorMessage(error)}
          onRetry={reload}
        />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Overview of store activity." />
        <StatGridSkeleton count={4} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Skeleton className="h-96 xl:col-span-2" />
          <Skeleton className="h-96 xl:col-span-3" />
        </div>
      </div>
    );
  }

  const topProducts = getTopProducts(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={
          data?.period
            ? `Store overview · ${formatDate(data.period.from)} → ${formatDate(data.period.to)}`
            : "Store overview"
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
              <TrendingUp className="h-4 w-4" aria-hidden />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
            <Link to="/admin/orders" className={buttonClasses("primary", "sm")}>
              View orders
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </>
        }
      />

      {/* Primary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total revenue"
          value={formatMoney(summary?.totalRevenue)}
          sub="All time, excluding cancelled orders"
        />
        <StatCard icon={Users} label="Total users" value={formatNumber(summary?.totalUsers)} sub="Active accounts" />
        <StatCard icon={Package} label="Total products" value={formatNumber(summary?.totalProducts)} sub="Active products" />
        <StatCard icon={ShoppingBag} label="Total orders" value={formatNumber(summary?.totalOrders)} sub="All orders placed" />
      </div>

      {/* Period tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <Coins className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> Revenue — last 30 days
          </div>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)] tabular-nums">
            {formatMoney(summary?.revenueLast30Days)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{formatNumber(summary?.ordersLast30Days)} orders in the period</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <Sparkles className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> This month
          </div>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)] tabular-nums">
            {formatMoney(summary?.revenueThisMonth)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{formatNumber(summary?.ordersThisMonth)} orders this month</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <Users className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> New customers — last 30 days
          </div>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)] tabular-nums">
            {formatNumber(summary?.userGrowthLast30Days)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Accounts created in the period</p>
        </Card>
      </div>

      {/* Top products + recent orders */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">Top products</h2>
              <p className="text-xs text-neutral-400">By revenue · last 30 days</p>
            </div>
          </div>
          <TopProducts products={topProducts} />
        </Card>

        <Card className="overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">Recent orders</h2>
              <p className="text-xs text-neutral-400">Latest 5 orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="tap-scale inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#7c5a28] transition-colors hover:bg-[var(--color-sand)]"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <RecentOrdersTable orders={data?.recentOrders ?? []} />
        </Card>
      </div>
    </div>
  );
}
