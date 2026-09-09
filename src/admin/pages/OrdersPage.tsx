/**
 * MONSTORE — Admin Orders (/admin/orders).
 * Connects to GET /api/admin/orders, PATCH /api/admin/orders/:id/status and
 * POST /api/admin/orders/:id/paid.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  ClipboardList,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SearchX,
  ShoppingBag,
  StickyNote,
  UserRound,
} from "lucide-react";
import { clearAuth } from "../../api/client";
import { adminApi } from "../../api/admin";
import { useDebouncedValue, useFetch } from "../hooks";
import { useToast } from "../Toast";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Pagination,
  TableSkeleton,
  Thumb,
} from "../ui";
import {
  formatDate,
  formatMoney,
  formatNumber,
  getApiErrorMessage,
  humanizeStatus,
  isAuthError,
  metaFor,
  ORDER_STATUSES,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  personName,
} from "../lib";
import type { AdminOrder, AdminOrderItem } from "../../types/admin";

const PAGE_SIZE = 12;

function customerName(order: AdminOrder): string {
  return personName(order.user?.firstName, order.user?.lastName, order.user?.email, order.fullName || "—");
}

/** Pick the updated order object out of any successful mutation response. */
function extractUpdatedOrder(response: unknown): Partial<AdminOrder> | null {
  if (!response || typeof response !== "object") return null;
  const raw = response as Record<string, unknown>;
  const candidate = raw.order && typeof raw.order === "object" ? (raw.order as Record<string, unknown>) : raw;
  if (typeof candidate.id === "string" && ("status" in candidate || "paymentStatus" in candidate)) {
    return candidate as Partial<AdminOrder>;
  }
  return null;
}

function OrderItems({ items }: { items?: AdminOrderItem[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-neutral-400">No items recorded for this order.</p>;
  }
  return (
    <ul className="divide-y divide-neutral-50">
      {items.map((item) => (
        <li key={item.id ?? `${item.productId}-${item.productName}`} className="flex items-center gap-3 py-2.5">
          <Thumb src={item.image} alt={item.productName} icon={ShoppingBag} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.productName ?? "Product"}</p>
            <p className="text-xs text-neutral-400">
              {formatNumber(item.quantity)} × {formatMoney(item.unitPrice)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-[var(--color-ink)] tabular-nums">{formatMoney(item.totalPrice)}</p>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);

  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "status" | "paid";
    status?: string;
  } | null>(null);
  const [mutating, setMutating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, loading, error, reload, setData } = useFetch(
    () => adminApi.orders({ page, limit: PAGE_SIZE, status: statusFilter || undefined, search: search || undefined }),
    [page, statusFilter, search]
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const orders = data?.data ?? [];
  const meta = data?.meta ?? null;

  function openOrder(order: AdminOrder) {
    setSelected(order);
    setDetailOpen(true);
  }

  function handleSessionError(err: unknown) {
    if (isAuthError(err)) {
      clearAuth();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  }

  function mergeOrderUpdate(id: string, updated: Partial<AdminOrder>) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((order) => {
          if (order.id !== id) return order;
          const payment = updated.payment
            ? { ...(order.payment ?? {}), ...(updated.payment as object) }
            : order.payment;
          return { ...order, ...updated, payment };
        }),
      };
    });
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
  }

  async function runMutation() {
    if (!selected || !confirm) return;
    if (confirm.type === "status" && !confirm.status) return;
    setMutating(true);
    try {
      let response: unknown;
      if (confirm.type === "paid") {
        response = await adminApi.markOrderPaid(selected.id);
      } else {
        response = await adminApi.updateOrderStatus(selected.id, confirm.status as string);
      }

      const updated = extractUpdatedOrder(response);
      if (updated && updated.id === selected.id) {
        mergeOrderUpdate(selected.id, updated);
      } else {
        reload();
      }
      if (confirm.type === "paid") {
        toast.success(`Order ${selected.orderNumber ?? selected.id} marked as paid.`);
      } else {
        toast.success(
          `Order ${selected.orderNumber ?? selected.id} moved to ${metaFor(ORDER_STATUS_META, confirm.status).label}.`
        );
      }
      setDetailOpen(false);
    } catch (err) {
      if (!handleSessionError(err)) {
        // Surface the backend error inside the still-open dialog.
        setConfirm(null);
        setSelected((prev) => (prev ? { ...prev, _flashError: getApiErrorMessage(err) } : prev));
      }
    } finally {
      setMutating(false);
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Track orders, update their status and confirm payments."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh orders">
            <RefreshCw className="h-4 w-4" aria-hidden />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      {/* Toolbar */}
      <Card className="p-3.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search order number or customer…"
              aria-label="Search orders"
              className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="order-status-filter" className="text-xs font-medium text-neutral-500">
              Status
            </label>
            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-neutral-300 bg-white px-3 pr-8 text-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanizeStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-neutral-500 md:ml-auto">
            {meta ? (
              <>
                <span className="font-semibold text-neutral-700">{formatNumber(meta.total)}</span> order{meta.total === 1 ? "" : "s"}
              </>
            ) : null}
          </p>
        </div>
      </Card>

      {/* Body */}
      {error && !data ? (
        <ErrorState title="Could not load orders" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <TableSkeleton rows={9} cells={5} />
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={search || statusFilter ? SearchX : ShoppingBag}
            title={search || statusFilter ? "No matching orders" : "No orders yet"}
            description={
              search || statusFilter
                ? "Try adjusting your search or status filter."
                : "Orders placed on the storefront will appear here."
            }
            action={
              search || statusFilter ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchInput("");
                    setStatusFilter("");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                  <th scope="col" className="px-5 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Items</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
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
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-500">
                        {formatNumber(order.items?.length ?? order.itemsCount)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-[var(--color-ink)] tabular-nums">
                        {formatMoney(order.total)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={payment.tone} dot>{payment.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={status.tone} dot>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="secondary" size="sm" onClick={() => openOrder(order)}>
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </Card>
      )}

      {/* ---------- Order detail dialog ---------- */}
      <Modal
        open={detailOpen}
        onClose={() => {
          if (!mutating) setDetailOpen(false);
        }}
        title={selected?.orderNumber ?? "Order"}
        subtitle={`Placed ${formatDate(selected?.createdAt, true)}`}
        size="xl"
        footer={
          <>
            <div className="mr-auto text-xs text-neutral-400">Changes are applied immediately.</div>
            <Button variant="secondary" onClick={() => setDetailOpen(false)} disabled={mutating}>
              Close
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-6">
            {selected._flashError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {selected._flashError}
              </div>
            )}

            {/* Status & payment controls */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <ClipboardList className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> Order status
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Badge tone={metaFor(ORDER_STATUS_META, selected.status).tone} dot>
                    {metaFor(ORDER_STATUS_META, selected.status).label}
                  </Badge>
                  <select
                    aria-label="Update order status"
                    value={selected._pendingStatus ?? selected.status ?? ""}
                    disabled={mutating}
                    onChange={(event) => {
                      const next = event.target.value;
                      if (!next || next === selected.status) return;
                      setSelected((prev) => (prev ? { ...prev, _pendingStatus: next } : prev));
                    }}
                    className="ml-auto h-9 rounded-lg border border-neutral-300 bg-white px-2.5 text-xs font-medium outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25 disabled:opacity-60"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {humanizeStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
                {(selected._pendingStatus ?? "") !== (selected.status ?? "") && (
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelected((prev) => (prev ? { ...prev, _pendingStatus: undefined } : prev))}
                      disabled={mutating}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      loading={mutating}
                      onClick={() => setConfirm({ type: "status", status: selected._pendingStatus ?? selected.status })}
                    >
                      Apply status
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <CreditCard className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> Payment
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Badge tone={metaFor(PAYMENT_STATUS_META, selected.paymentStatus).tone} dot>
                    {metaFor(PAYMENT_STATUS_META, selected.paymentStatus).label}
                  </Badge>
                  <span className="text-xs text-neutral-400">{selected.paymentMethod ?? "—"}</span>
                  {(selected.paymentStatus === "PENDING" || !selected.paymentStatus) && (
                    <Button
                      size="sm"
                      variant="gold"
                      className="ml-auto"
                      loading={mutating}
                      onClick={() => setConfirm({ type: "paid" })}
                    >
                      <Banknote className="h-4 w-4" aria-hidden />
                      Mark as paid
                    </Button>
                  )}
                </div>
                {(selected.paymentStatus === "PENDING" || !selected.paymentStatus) && (
                  <p className="mt-3 text-xs text-neutral-400">
                    Confirms the COD payment and moves a pending order to “Confirmed”.
                  </p>
                )}
              </div>
            </div>

            {/* Customer + shipping */}
            <div className="rounded-xl border border-neutral-200 p-4 sm:p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <UserRound className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> Customer
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{customerName(selected)}</p>
                  <a href={`tel:${selected.phone ?? ""}`} className="mt-1 inline-flex items-center gap-1.5 text-neutral-500 hover:text-[var(--color-ink)]">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> {selected.phone ?? "—"}
                  </a>
                  {selected.user?.email && (
                    <a href={`mailto:${selected.user.email}`} className="mt-1 inline-flex items-center gap-1.5 text-neutral-500 hover:text-[var(--color-ink)]">
                      <Mail className="h-3.5 w-3.5" aria-hidden /> {selected.user.email}
                    </a>
                  )}
                </div>
                <div className="text-neutral-600">
                  <p className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                    <span>
                      {[selected.address, selected.city, selected.country].filter(Boolean).join(", ") || "—"}
                    </span>
                  </p>
                  {selected.shippingLabel && <p className="mt-1 pl-5 text-xs text-neutral-400">Shipping: {selected.shippingLabel}</p>}
                </div>
              </div>
              {selected.notes && (
                <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span><span className="font-semibold">Notes:</span> {selected.notes}</span>
                </p>
              )}
            </div>

            {/* Items */}
            <div className="rounded-xl border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <ShoppingBag className="h-4 w-4 text-[var(--color-gold)]" aria-hidden /> Items
                </p>
                <p className="text-xs text-neutral-400">
                  {formatNumber(selected.items?.length ?? selected.itemsCount)} line{selected.items?.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-2">
                <OrderItems items={selected.items} />
              </div>
              <dl className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(selected.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">{formatMoney(selected.shipping ?? selected.shippingCost)}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-[var(--color-ink)]">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(selected.total)}</dd>
                </div>
              </dl>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-400">
              <span>Order ID: <span className="font-mono">{selected.id}</span></span>
              <span>Last updated: {formatDate(selected.updatedAt, true)}</span>
              {selected.couponCode && <span>Coupon: {selected.couponCode}</span>}
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Confirmations ---------- */}
      <ConfirmDialog
        open={Boolean(confirm)}
        busy={mutating}
        title={confirm?.type === "paid" ? "Mark order as paid?" : "Change order status?"}
        tone={confirm?.type === "status" && confirm.status === "CANCELLED" ? "danger" : "primary"}
        confirmLabel={
          confirm?.type === "paid"
            ? "Mark as paid"
            : confirm?.status === "CANCELLED"
              ? "Cancel order"
              : `Move to ${humanizeStatus(confirm?.status)}`
        }
        message={
          confirm?.type === "paid" ? (
            <>You are about to mark <strong>{selected?.orderNumber ?? "this order"}</strong> as paid. This cannot be undone automatically.</>
          ) : confirm?.status === "CANCELLED" ? (
            <>
              You are about to set <strong>{selected?.orderNumber ?? "this order"}</strong> to{" "}
              <strong>Cancelled</strong>. Cancelled orders are excluded from revenue. Continue?
            </>
          ) : (
            <>
              Update <strong>{selected?.orderNumber ?? "this order"}</strong> to{" "}
              <strong>{humanizeStatus(confirm?.status)}</strong>?
            </>
          )
        }
        onCancel={() => {
          if (!mutating) setConfirm(null);
        }}
        onConfirm={runMutation}
      />
    </div>
  );
}
