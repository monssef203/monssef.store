/**
 * MONSTORE — Admin route guard.
 *
 * Frontend protection only — the backend independently enforces auth + ADMIN
 * on every /api/admin route.
 *
 *   Unauthenticated  → redirect to /admin/login (remembers the destination)
 *   Authenticated
 *     role ADMIN     → render the admin layout + page
 *     role CUSTOMER  → Access Denied screen
 */

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldAlert, Store } from "lucide-react";
import { clearAuth, getAuthToken, getCurrentUser } from "../api/client";
import AdminLayout from "./AdminLayout";
import { Button, buttonClasses } from "./ui";

function AccessDenied() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function signInAsAdmin() {
    clearAuth();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-[0_10px_40px_rgba(15,15,16,0.06)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-sand)]">
          <ShieldAlert className="h-8 w-8 text-[var(--color-gold)]" aria-hidden />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#7c5a28]">403 · Restricted</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--color-ink)]">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          {user?.email ? (
            <>
              <span className="font-semibold text-neutral-700">{user.email}</span> is signed in, but this area is reserved
              for administrators.
            </>
          ) : (
            <>This area is reserved for administrators.</>
          )}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link to="/" className={buttonClasses("secondary", "md")}>
            <Store className="h-4 w-4" aria-hidden />
            Back to store
          </Link>
          <Button onClick={signInAsAdmin}>
            Sign in as admin
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RequireAdmin() {
  const location = useLocation();
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    const from = location.pathname === "/admin" ? "" : `${location.pathname}${location.search}`;
    return <Navigate to="/admin/login" replace state={from ? { from } : undefined} />;
  }

  if (user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return <AdminLayout />;
}
