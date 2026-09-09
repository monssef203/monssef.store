/**
 * MONSTORE — Admin Users (/admin/users).
 * Connects to GET /api/admin/users and PATCH /api/admin/users/:id
 * (toggle active / change role).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, RefreshCw, Search, SearchX, ShieldCheck, TriangleAlert, UserRound, Users } from "lucide-react";
import { clearAuth, getCurrentUser } from "../../api/client";
import { adminApi } from "../../api/admin";
import { useDebouncedValue, useFetch } from "../hooks";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pagination, TableSkeleton } from "../ui";
import {
  formatDate,
  formatNumber,
  getApiErrorMessage,
  getInitials,
  humanizeStatus,
  isAuthError,
  personName,
  USER_ROLES,
} from "../lib";
import type { AdminUser } from "../../types/admin";
import { useToast } from "../Toast";

const PAGE_SIZE = 15;

export default function UsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);

  const [confirm, setConfirm] = useState<{ user: AdminUser; kind: "deactivate" | "activate" | "role"; role?: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, error, reload, setData } = useFetch(
    () => adminApi.users({ page, limit: PAGE_SIZE, search: search || undefined, role: roleFilter || undefined }),
    [page, search, roleFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const currentUserId = getCurrentUser()?.id;
  const users = data?.data ?? [];
  const meta = data?.meta ?? null;

  const confirmKind = confirm?.kind ?? null;
  const confirmUser = confirm?.user ?? null;
  const confirmRole = confirm?.role ?? null;

  function handleSessionError(err: unknown): boolean {
    if (isAuthError(err)) {
      clearAuth();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  }

  async function runConfirmedAction() {
    if (!confirm) return;
    const { user, kind } = confirm;
    setBusyId(user.id);
    try {
      const payload = kind === "role" && confirm.role ? { role: confirm.role } : { isActive: kind === "activate" };
      const res = await adminApi.updateUser(user.id, payload);
      const updated = res.user;
      if (updated) {
        setData((prev) =>
          prev ? { ...prev, data: prev.data.map((u) => (u.id === user.id && updated ? { ...u, ...updated } : u)) } : prev
        );
      }
      reload(); // canonicalize the list (sort order / counts)
      setConfirm(null);
      toast.success(res.message ?? (kind === "role" ? "Role updated successfully." : "Account updated successfully."));
    } catch (err) {
      if (!handleSessionError(err)) {
        setConfirm(null);
        toast.error(getApiErrorMessage(err));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="View customers and manage their accounts."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={loading} aria-label="Refresh users">
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
              placeholder="Search email, name or phone…"
              aria-label="Search users"
              className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="user-role-filter" className="text-xs font-medium text-neutral-500">
              Role
            </label>
            <select
              id="user-role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-10 rounded-xl border border-neutral-300 bg-white px-3 pr-8 text-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25"
            >
              <option value="">All roles</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {humanizeStatus(role)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-neutral-500 md:ml-auto">
            {meta ? (
              <>
                <span className="font-semibold text-neutral-700">{formatNumber(meta.total)}</span> user{meta.total === 1 ? "" : "s"}
              </>
            ) : null}
          </p>
        </div>
      </Card>

      {/* Body */}
      {error && !data ? (
        <ErrorState title="Could not load users" message={getApiErrorMessage(error)} onRetry={reload} />
      ) : loading && !data ? (
        <TableSkeleton rows={9} cells={5} />
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            icon={search || roleFilter ? SearchX : Users}
            title={search || roleFilter ? "No matching users" : "No users yet"}
            description={
              search || roleFilter
                ? "Try adjusting your search or role filter."
                : "Registered customers will appear here."
            }
            action={
              search || roleFilter ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchInput("");
                    setRoleFilter("");
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
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                  <th scope="col" className="px-5 py-3 font-semibold">User</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Contact</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Orders</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Addresses</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const name = personName(user.firstName, user.lastName, user.email, "—");
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-sand)] text-xs font-bold text-[#7c5a28]" aria-hidden>
                            {getInitials(name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="flex max-w-[240px] items-center gap-1.5 truncate font-semibold text-[var(--color-ink)]">
                              {name}
                              {isSelf && (
                                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-500">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-neutral-400">
                              <UserRound className="h-3 w-3" aria-hidden />
                              {user.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="flex items-center gap-1.5 text-neutral-600">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                          <span className="max-w-[200px] truncate">{user.email ?? "—"}</span>
                        </p>
                        {user.phone && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                            <Phone className="h-3 w-3 shrink-0" aria-hidden />
                            {user.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          aria-label={`Role for ${name}`}
                          value={user.role ?? "CUSTOMER"}
                          disabled={isSelf || busy}
                          title={isSelf ? "You cannot change your own role" : "Change role"}
                          onChange={(event) => {
                            const next = event.target.value;
                            if (next !== user.role) setConfirm({ user, kind: "role", role: next });
                          }}
                          className="h-9 rounded-lg border border-neutral-300 bg-white px-2.5 text-xs font-medium outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {humanizeStatus(role)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.isActive ? (
                          <Badge tone="emerald" dot>Active</Badge>
                        ) : (
                          <Badge tone="neutral" dot>Inactive</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {formatNumber(user.orderCount)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {formatNumber(user.addressCount)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-neutral-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant={user.isActive ? "secondary" : "gold"}
                          loading={busy}
                          disabled={isSelf}
                          title={isSelf ? "You cannot modify your own account" : undefined}
                          onClick={() =>
                            setConfirm({
                              user,
                              kind: user.isActive ? "deactivate" : "activate",
                            })
                          }
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
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

      <Card className="p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" aria-hidden />
          Granting the <strong>Admin</strong> role gives full backend access. Your own account cannot be modified from
          this screen.
        </p>
      </Card>

      {/* Confirmations */}
      <ConfirmDialog
        open={Boolean(confirm)}
        busy={busyId !== null}
        title={
          confirmKind === "role"
            ? "Change user role?"
            : confirmKind === "deactivate"
              ? "Deactivate account?"
              : "Activate account?"
        }
        tone={confirmKind === "deactivate" ? "danger" : "primary"}
        confirmLabel={
          confirmKind === "role"
            ? `Make ${humanizeStatus(confirmRole)}`
            : confirmKind === "deactivate"
              ? "Deactivate"
              : "Activate"
        }
        message={
          confirmKind === "role" && confirmUser ? (
            <>
              Change <strong>{personName(confirmUser.firstName, confirmUser.lastName, confirmUser.email)}</strong>'s role
              to <strong>{humanizeStatus(confirmRole)}</strong>?
              {confirmRole === "ADMIN" && (
                <span className="mt-2 flex items-start gap-2 rounded-lg bg-[var(--color-sand)] px-3 py-2 text-xs text-[#7c5a28]">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  This grants full access to the admin area and all admin APIs.
                </span>
              )}
            </>
          ) : confirmKind === "deactivate" && confirmUser ? (
            <>
              Deactivate <strong>{personName(confirmUser.firstName, confirmUser.lastName, confirmUser.email)}</strong>? The
              user will no longer be able to sign in or place orders.
            </>
          ) : confirmUser ? (
            <>
              Reactivate <strong>{personName(confirmUser.firstName, confirmUser.lastName, confirmUser.email)}</strong>?
              They will regain access to their account.
            </>
          ) : null
        }
        onCancel={() => {
          if (!busyId) setConfirm(null);
        }}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
}
