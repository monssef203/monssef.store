/**
 * MONSTORE — Admin login (/admin/login).
 *
 * Uses the EXISTING authentication system (authApi.login → JWT stored by the
 * shared API client). Non-admin accounts are rejected client-side after a
 * successful login, and the backend independently enforces ADMIN on every
 * admin endpoint.
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, TriangleAlert } from "lucide-react";
import { authApi, clearAuth, getAuthToken, getCurrentUser } from "../api/client";
import { STORE_NAME } from "../config/config";
import { cn } from "../utils/cn";
import { Button } from "./ui";
import { getApiErrorMessage } from "./lib";

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Already signed in as admin? Go straight to the dashboard.
  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();
    if (token && user?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  function validate(): boolean {
    const next: FieldErrors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Email is required.";
    } else if (!EMAIL_RE.test(trimmed)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    setErrors(next);
    if (next.email) emailRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (busy || !validate()) return;

    setBusy(true);
    try {
      const result = await authApi.login({ email: email.trim(), password });
      const role = result.user?.role;

      if (role !== "ADMIN") {
        // Valid credentials but not an administrator — never let them into /admin.
        clearAuth();
        setPassword("");
        setFormError(
          "This account does not have administrator access. Please sign in with an administrator account."
        );
        return;
      }

      const state = location.state as { from?: string } | null;
      const destination = state?.from && state.from.startsWith("/admin") ? state.from : "/admin";
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      {/* ---------- Brand panel (desktop) ---------- */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[var(--color-ink)] p-12 text-white lg:flex xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full opacity-[0.14]"
          style={{ background: "radial-gradient(circle, #b78d55 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full opacity-[0.1]"
          style={{ background: "radial-gradient(circle, #b78d55 0%, transparent 65%)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-gold)] font-serif text-2xl font-bold text-[var(--color-ink)]">
            M
          </span>
          <div>
            <p className="font-serif text-2xl font-semibold tracking-[0.14em]">{STORE_NAME}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-gold-light)]">Administration</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="font-serif text-[42px] font-medium leading-[1.15] text-white">
            Your store,
            <br />
            <span className="italic text-[var(--color-gold-light)]">at a glance.</span>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-neutral-400">
            Orders, payments, catalogue, customers, sales and revenue — one calm, focused workspace for the MONSTORE team.
          </p>
          <div className="mt-10 h-px w-16 bg-[var(--color-gold)]" />
          <ul className="mt-8 space-y-3 text-sm text-neutral-300">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" aria-hidden /> Track and fulfil every order
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" aria-hidden /> Monitor sales &amp; revenue in real time
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" aria-hidden /> Manage your catalogue and customers
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-neutral-500">© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-ink)] font-serif text-xl font-bold text-[var(--color-gold-light)]">
              M
            </span>
            <div>
              <p className="font-serif text-xl font-semibold tracking-[0.14em] text-[var(--color-ink)]">{STORE_NAME}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#7c5a28]">Administration</p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7c5a28]">Admin sign in</p>
          <h1 className="font-display mt-2 text-[32px] leading-tight text-[var(--color-ink)]">Welcome back</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Sign in with your administrator account to manage the store.</p>

          {formError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
                Email
              </label>
              <div className="relative">
                <Mail
                  className={cn(
                    "pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2",
                    errors.email ? "text-red-400" : "text-neutral-400"
                  )}
                  aria-hidden
                />
                <input
                  ref={emailRef}
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "admin-email-error" : undefined}
                  placeholder="admin@monstore.ma"
                  disabled={busy}
                  className={cn(
                    "h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:opacity-60",
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-neutral-300 focus:border-[var(--color-gold)] focus:ring-[var(--color-gold)]/25"
                  )}
                />
              </div>
              {errors.email && (
                <p id="admin-email-error" className="mt-1.5 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={cn(
                    "pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2",
                    errors.password ? "text-red-400" : "text-neutral-400"
                  )}
                  aria-hidden
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "admin-password-error" : undefined}
                  placeholder="••••••••"
                  disabled={busy}
                  className={cn(
                    "h-12 w-full rounded-xl border bg-white py-3 pl-11 pr-12 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:opacity-60",
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-neutral-300 focus:border-[var(--color-gold)] focus:ring-[var(--color-gold)]/25"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="tap-scale absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[var(--color-ink)]"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
                </button>
              </div>
              {errors.password && (
                <p id="admin-password-error" className="mt-1.5 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" loading={busy} className="w-full" size="md">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Protected area — restricted to administrators of {STORE_NAME}.
          </p>

          <Link
            to="/"
            className="tap-scale mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to storefront
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
