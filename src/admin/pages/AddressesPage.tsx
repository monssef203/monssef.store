/**
 * MONSTORE — Admin Addresses (/admin/addresses).
 * Connects to GET /api/admin/addresses and renders the address information
 * returned by the backend (array or paginated envelope).
 */

import { useMemo, useState } from "react";
import { Mail, MapPin, Phone, RefreshCw, Search, SearchX, Star } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useFetch } from "../hooks";
import { Badge, Button, Card, EmptyState, ErrorState, ListSkeleton, PageHeader } from "../ui";
import { formatDate, formatNumber, getApiErrorMessage } from "../lib";
import type { AdminAddress, PaginationMeta } from "../../types/admin";

function countryName(code?: string): string {
  if (!code) return "";
  return code.toUpperCase() === "MA" ? "Morocco" : code;
}

function normalizeAddresses(raw: AdminAddress[] | { data?: AdminAddress[]; meta?: PaginationMeta } | null): {
  items: AdminAddress[];
  meta: PaginationMeta | null;
} {
  if (!raw) return { items: [], meta: null };
  if (Array.isArray(raw)) return { items: raw, meta: null };
  return { items: raw.data ?? [], meta: raw.meta ?? null };
}

function addressOwner(address: AdminAddress): string {
  if (address.user) {
    const name = [address.user.firstName, address.user.lastName].filter(Boolean).join(" ").trim();
    if (name) return name;
    if (address.user.email) return address.user.email;
  }
  return address.email ?? address.fullName ?? "—";
}

export default function AddressesPage() {
  const [searchInput, setSearchInput] = useState("");
  const { data, loading, error, reload } = useFetch(() => adminApi.addresses(), []);

  const { items, meta } = useMemo(() => normalizeAddresses(data), [data]);

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return items;
    return items.filter((address) =>
      [
        address.fullName,
        address.label,
        address.city,
        address.address,
        address.country,
        address.phone,
        addressOwner(address),
        address.user?.email ?? address.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, searchInput]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addresses"
        subtitle="Shipping and billing addresses saved by customers."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh addresses">
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
              placeholder="Search owner, city or address…"
              aria-label="Search addresses"
              className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            />
          </div>
          <p className="text-xs text-neutral-500 sm:ml-auto">
            {meta ? (
              <>
                <span className="font-semibold text-neutral-700">{formatNumber(meta.total)}</span> address{meta.total === 1 ? "" : "es"} on the server
              </>
            ) : items.length > 0 ? (
              <>
                <span className="font-semibold text-neutral-700">{formatNumber(items.length)}</span> address{items.length === 1 ? "" : "es"}
              </>
            ) : null}
            {searchInput.trim() && (
              <>
                {" · "}
                {formatNumber(filtered.length)} match{filtered.length === 1 ? "" : "es"}
              </>
            )}
          </p>
        </div>
      </Card>

      {/* Body */}
      {error && !data ? (
        <ErrorState title="Could not load addresses" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={searchInput.trim() ? SearchX : MapPin}
            title={searchInput.trim() ? "No matching addresses" : "No addresses yet"}
            description={
              searchInput.trim()
                ? "Try a different search term."
                : "Addresses saved by customers on checkout will appear here."
            }
            action={
              searchInput.trim() ? (
                <Button variant="secondary" onClick={() => setSearchInput("")}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((address) => (
            <Card key={address.id ?? `${address.userId}-${address.address}-${address.city}`} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-sand)] text-[var(--color-gold)]">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <div className="flex items-center gap-1.5">
                  {address.label && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      {address.label}
                    </span>
                  )}
                  {address.isDefault && (
                    <Badge tone="gold" dot>
                      Default
                    </Badge>
                  )}
                </div>
              </div>

              <p className="mt-4 font-display text-lg font-semibold text-[var(--color-ink)]">{address.fullName ?? "—"}</p>
              <p className="mt-0.5 truncate text-xs text-neutral-400" title={addressOwner(address)}>
                {addressOwner(address)}
              </p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                {[address.address, address.city].filter(Boolean).join(", ")}
                <span className="text-neutral-400">
                  {address.country ? ` · ${countryName(address.country)}` : ""}
                </span>
              </p>

              <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                {address.phone && (
                  <a href={`tel:${address.phone}`} className="flex items-center gap-2 hover:text-[var(--color-ink)]">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                    {address.phone}
                  </a>
                )}
                {(address.user?.email || address.email) && (
                  <a href={`mailto:${address.user?.email ?? address.email}`} className="flex items-center gap-2 truncate hover:text-[var(--color-ink)]">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                    <span className="truncate">{address.user?.email ?? address.email}</span>
                  </a>
                )}
                <p className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden />
                  <span>
                    Added {formatDate(address.createdAt)}
                    {address.userId ? ` · user ${address.userId.slice(0, 8)}` : ""}
                  </span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
