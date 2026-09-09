/**
 * MONSTORE — Admin layout.
 *
 * Desktop: fixed dark sidebar + sticky top bar with profile menu.
 * Mobile/tablet: slide-in drawer navigation with overlay.
 * Renders child routes through <Outlet />.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { authApi, clearAuth, getAuthToken, getCurrentUser } from "../api/client";
import { cn } from "../utils/cn";
import { ToastProvider } from "./Toast";
import { useEscape } from "./hooks";
import { getInitials, personName } from "./lib";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/sales", label: "Sales", icon: BarChart3 },
  { to: "/admin/revenue", label: "Revenue", icon: Wallet },
  { to: "/admin/addresses", label: "Addresses", icon: MapPin },
];

function Brand({ dark = true }: { dark?: boolean }) {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 px-1" aria-label="MONSTORE admin home">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg font-serif text-lg font-bold",
          dark ? "bg-[var(--color-gold)] text-[var(--color-ink)]" : "bg-[var(--color-ink)] text-[var(--color-gold-light)]"
        )}
      >
        M
      </span>
      <span className={cn("font-serif text-[22px] font-semibold tracking-[0.14em]", dark ? "text-white" : "text-[var(--color-ink)]")}>
        MONSTORE
      </span>
      <span
        className={cn(
          "ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]",
          dark ? "bg-white/10 text-[var(--color-gold-light)]" : "bg-[var(--color-sand)] text-[#7c5a28]"
        )}
      >
        Admin
      </span>
    </Link>
  );
}

function NavItems({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  return (
    <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
              compact ? "px-3 py-2.5" : "px-3.5 py-2.5",
              isActive ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-[var(--color-gold-light)]" : "text-neutral-500 group-hover:text-neutral-300"
                )}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-gold)]" aria-hidden />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AccountBlock({
  name,
  email,
  role,
  onLogout,
  onNavigateStore,
  dark = true,
}: {
  name: string;
  email: string;
  role?: string;
  onLogout: () => void;
  onNavigateStore?: () => void;
  dark?: boolean;
}) {
  return (
    <div className={cn("border-t px-4 pb-5 pt-4", dark ? "border-white/10" : "border-neutral-200")}>
      {onNavigateStore && (
        <Link
          to="/"
          onClick={onNavigateStore}
          className={cn(
            "mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
            dark ? "text-neutral-400 hover:bg-white/5 hover:text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-[var(--color-ink)]"
          )}
        >
          <Store className="h-4 w-4" aria-hidden />
          View storefront
          <ExternalLink className="ml-auto h-3 w-3 opacity-60" aria-hidden />
        </Link>
      )}
      <div className={cn("flex items-center gap-3 rounded-xl p-2.5", dark ? "bg-white/[0.05]" : "bg-neutral-50")}>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            dark ? "bg-[var(--color-gold)] text-[var(--color-ink)]" : "bg-[var(--color-ink)] text-white"
          )}
          aria-hidden
        >
          {getInitials(name, email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-semibold", dark ? "text-white" : "text-[var(--color-ink)]")}>{name}</p>
          <p className={cn("truncate text-[10px] font-bold uppercase tracking-wider", dark ? "text-[var(--color-gold-light)]" : "text-[#7c5a28]")}>
            {role || "Administrator"}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className={cn(
            "tap-scale rounded-lg p-2 transition-colors",
            dark ? "text-neutral-400 hover:bg-white/10 hover:text-white" : "text-neutral-400 hover:bg-neutral-100 hover:text-[var(--color-ink)]"
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = getCurrentUser();
  const token = getAuthToken();
  const name = personName(user?.firstName, user?.lastName, user?.email, "Administrator");
  const email = user?.email ?? "";

  const pageTitle = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    return match?.label ?? "Admin";
  }, [location.pathname]);

  // Close overlays + scroll to top on navigation.
  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEscape(drawerOpen || profileOpen, () => {
    setDrawerOpen(false);
    setProfileOpen(false);
  });

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Backend may be unreachable — still clear the local session below.
    }
    clearAuth();
    navigate("/admin/login", { replace: true });
  }

  // Guard double-check: if no session exists anymore, send to login.
  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
        {/* ---------- Desktop sidebar ---------- */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col bg-[var(--color-ink)] py-5 text-white lg:flex">
          <div className="px-5">
            <Brand dark />
          </div>
          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <NavItems />
          </div>
          <AccountBlock name={name} email={email} role={user.role} onLogout={handleLogout} />
        </aside>

        {/* ---------- Mobile drawer ---------- */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                key="drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] bg-[var(--color-ink)]/60 backdrop-blur-[2px] lg:hidden"
                onClick={() => setDrawerOpen(false)}
                aria-hidden
              />
              <motion.aside
                key="drawer-panel"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-label="Admin navigation"
                className="fixed inset-y-0 left-0 z-[80] flex w-[300px] max-w-[86vw] flex-col bg-[var(--color-ink)] py-5 text-white shadow-2xl lg:hidden"
              >
                <div className="flex items-center justify-between gap-2 px-5">
                  <Brand dark />
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                    className="tap-scale rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-6 flex-1 overflow-y-auto px-3">
                  <NavItems onNavigate={() => setDrawerOpen(false)} />
                </div>
                <AccountBlock name={name} email={email} role={user.role} onLogout={handleLogout} onNavigateStore={() => setDrawerOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ---------- Main column ---------- */}
        <div className="flex min-h-screen flex-col lg:pl-[272px]">
          <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-[var(--color-cream)]/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open admin menu"
                  className="tap-scale -ml-2 flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-[var(--color-ink)] lg:hidden"
                >
                  <Menu className="h-5.5 w-5.5" aria-hidden />
                </button>
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="hidden text-xs font-semibold uppercase tracking-widest text-neutral-400 sm:inline">Admin</span>
                  <span className="hidden text-neutral-300 sm:inline">/</span>
                  <h1 className="truncate text-[15px] font-semibold text-[var(--color-ink)] sm:text-base">{pageTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/"
                  className={cn(
                    "tap-scale hidden items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-neutral-400 hover:text-[var(--color-ink)] md:inline-flex"
                  )}
                >
                  <Store className="h-3.5 w-3.5" aria-hidden />
                  Store
                </Link>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    aria-label="Account menu"
                    className={cn(
                      "tap-scale flex h-9 items-center gap-2 rounded-full border pl-1 pr-2 transition-colors",
                      profileOpen
                        ? "border-[var(--color-gold)] bg-white shadow-sm"
                        : "border-neutral-300 bg-white hover:border-neutral-400"
                    )}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] font-bold text-[var(--color-gold-light)]" aria-hidden>
                      {getInitials(name, email)}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-xs font-semibold text-neutral-700 sm:block">{name.split(" ")[0]}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform", profileOpen && "rotate-180")} aria-hidden />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden />
                      <div
                        role="menu"
                        aria-label="Account"
                        className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
                      >
                        <div className="px-3 py-2.5">
                          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{name}</p>
                          <p className="truncate text-xs text-neutral-500">{email}</p>
                          <span className="mt-2 inline-flex rounded-full bg-[var(--color-sand)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7c5a28]">
                            {user.role || "Administrator"}
                          </span>
                        </div>
                        <div className="my-1 border-t border-neutral-100" />
                        <Link
                          to="/"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-[var(--color-ink)]"
                        >
                          <Store className="h-4 w-4 text-neutral-400" aria-hidden />
                          View storefront
                          <ExternalLink className="ml-auto h-3.5 w-3.5 text-neutral-300" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" aria-hidden />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </main>

          <footer className="px-4 pb-6 text-center text-[11px] text-neutral-400 sm:px-6 lg:px-10">
            MONSTORE Admin · Powered by the MONSTORE API
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
