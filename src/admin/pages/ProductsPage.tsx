/**
 * MONSTORE — Admin Products (/admin/products).
 * Connects to GET /api/admin/products (search + pagination supported by the API).
 */

import { useEffect, useState } from "react";
import { Package, PackageSearch, RefreshCw, Search, SearchX } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useDebouncedValue, useFetch } from "../hooks";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Pagination, TableSkeleton, Thumb } from "../ui";
import { formatDate, formatMoney, formatNumber, getApiErrorMessage, metaFor, PRODUCT_STATUS_META } from "../lib";
import type { AdminProduct } from "../../types/admin";

const PAGE_SIZE = 15;

function categoryName(product: AdminProduct): string {
  if (!product.category) return "—";
  if (typeof product.category === "string") return product.category;
  return product.category.name ?? "—";
}

function priceLabel(product: AdminProduct) {
  const base = Number(product.price ?? 0);
  const discounted = Number(product.discountPrice ?? base);
  if (discounted > 0 && discounted < base) {
    return (
      <span className="flex items-baseline gap-2">
        <span className="font-semibold text-[var(--color-ink)] tabular-nums">{formatMoney(discounted)}</span>
        <span className="text-xs text-neutral-400 line-through tabular-nums">{formatMoney(base)}</span>
      </span>
    );
  }
  return <span className="font-semibold text-[var(--color-ink)] tabular-nums">{formatMoney(base)}</span>;
}

function StockCell({ stock }: { stock?: number | null }) {
  const value = Number(stock ?? 0);
  const tone = value <= 0 ? "red" : value <= 5 ? "amber" : "emerald";
  const label = value <= 0 ? "Out of stock" : `${formatNumber(value)} in stock`;
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);

  const { data, loading, error, reload } = useFetch(
    () => adminApi.products({ page, limit: PAGE_SIZE, search: search || undefined }),
    [page, search]
  );

  // Reset to page 1 when a new search starts.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const products = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Browse the catalogue and monitor stock."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh products">
            <RefreshCw className="h-4 w-4" aria-hidden />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      {/* Toolbar */}
      <Card className="p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, SKU or brand…"
              aria-label="Search products"
              className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            />
          </div>
          <p className="text-xs text-neutral-500 sm:ml-auto">
            {meta ? (
              <>
                <span className="font-semibold text-neutral-700">{formatNumber(meta.total)}</span> product{meta.total === 1 ? "" : "s"}
                {search ? <> matching “{search}”</> : null}
              </>
            ) : null}
          </p>
        </div>
      </Card>

      {/* Body */}
      {error && !data ? (
        <ErrorState title="Could not load products" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <TableSkeleton rows={9} cells={5} />
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={search ? SearchX : Package}
            title={search ? "No products found" : "No products yet"}
            description={
              search
                ? `Nothing matches “${search}”. Try a different keyword.`
                : "Products added to the backend will appear here."
            }
            action={
              search ? (
                <Button variant="secondary" onClick={() => setSearchInput("")}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                  <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Price</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Stock</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Sales</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = metaFor(PRODUCT_STATUS_META, product.status);
                  const thumbSrc = product.image ?? product.images?.[0]?.url ?? null;
                  return (
                    <tr key={product.id} className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Thumb src={thumbSrc} alt={product.name} icon={Package} />
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-semibold text-[var(--color-ink)]">{product.name}</p>
                            <p className="text-xs text-neutral-400">
                              {product.sku ? `SKU ${product.sku}` : "No SKU"}
                              {product.brand ? ` · ${product.brand}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">{categoryName(product)}</td>
                      <td className="px-5 py-3.5 text-right">{priceLabel(product)}</td>
                      <td className="px-5 py-3.5"><StockCell stock={product.stock} /></td>
                      <td className="px-5 py-3.5">
                        <Badge tone={status.tone} dot>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {formatNumber(product.orderCount)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-neutral-500">{formatDate(product.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </Card>
      )}

      <Card className="p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
          <PackageSearch className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" aria-hidden />
          The backend exposes <code className="font-mono">GET /api/admin/products</code> for listing and searching only —
          no create/update/delete product endpoints exist — so this page is intentionally view-only.
        </p>
      </Card>
    </div>
  );
}
