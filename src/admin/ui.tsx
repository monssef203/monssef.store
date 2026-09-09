/**
 * MONSTORE — Reusable admin UI primitives.
 *
 * Built on the project's existing design tokens (ink / cream / sand / gold),
 * Tailwind and lucide icons — no new dependencies.
 */

import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { PaginationMeta } from "../types/admin";
import { useEscape } from "./hooks";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
export type ButtonSize = "sm" | "md";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-ink)] text-white shadow-sm hover:bg-black/85 active:bg-black focus-visible:ring-[var(--color-gold)]/50",
  secondary:
    "border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:border-neutral-400 hover:bg-neutral-50 focus-visible:ring-[var(--color-gold)]/40",
  ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-[var(--color-ink)] focus-visible:ring-neutral-300",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-300",
  gold: "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-sm hover:bg-[var(--color-gold-light)] focus-visible:ring-[var(--color-gold)]/50",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/** Shared button styling — also usable on Link/other elements. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(
    "tap-scale inline-flex select-none items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  );
}

export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export type Tone = "neutral" | "emerald" | "amber" | "red" | "sky" | "violet" | "cyan" | "gold" | "ink";

const TONE_BADGE: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-600 ring-neutral-600/15",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/25",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  gold: "bg-[var(--color-sand)] text-[#7c5a28] ring-[var(--color-gold)]/35",
  ink: "bg-[var(--color-ink)] text-white ring-black/10",
};

const TONE_DOT: Record<Tone, string> = {
  neutral: "bg-neutral-400",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  gold: "bg-[var(--color-gold)]",
  ink: "bg-neutral-200",
};

export function Badge({
  tone = "neutral",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        TONE_BADGE[tone],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} aria-hidden />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,15,16,0.04)]", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-sand)] text-[var(--color-gold)]">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      </div>
      <p className="mt-4 truncate text-[26px] font-semibold leading-tight text-[var(--color-ink)] tabular-nums">
        {value}
      </p>
      {sub && <div className="mt-1.5 text-xs text-neutral-500">{sub}</div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback states                                                     */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-10" : "py-16")}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-sand)]">
        <Icon className="h-6 w-6 text-[var(--color-gold)]" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  action,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert className="h-6 w-6 text-red-500" aria-hidden />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
        {message && <p className="mt-1.5 max-w-md break-words text-sm text-neutral-500">{message}</p>}
        {(onRetry || action) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {action}
            {onRetry && (
              <Button variant="secondary" onClick={onRetry}>
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-neutral-200/60", className)} />;
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="mt-4 h-7 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cells = 5, className }: { rows?: number; cells?: number; className?: string }) {
  return (
    <Card className={className}>
      <div className="overflow-x-auto p-5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-b border-neutral-100 py-4 last:border-0">
            {Array.from({ length: cells }).map((__, c) => (
              <Skeleton key={c} className={cn("h-4", c === 0 ? "w-1/3" : "flex-1")} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-8 w-2/3" />
          <Skeleton className="mt-3 h-3 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function Pagination({
  meta,
  onPageChange,
}: {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.total <= 0 || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4 sm:flex-row">
      <p className="text-xs text-neutral-500">
        Showing <span className="font-semibold text-neutral-700">{from}</span>–<span className="font-semibold text-neutral-700">{to}</span>{" "}
        of <span className="font-semibold text-neutral-700">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </Button>
        <span className="px-2 text-xs text-neutral-500">
          Page <span className="font-semibold text-neutral-700">{page}</span> of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal + confirm dialog                                              */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const titleId = useId();

  useEscape(open, onClose);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  const width = size === "md" ? "sm:max-w-lg" : size === "xl" ? "sm:max-w-4xl" : "sm:max-w-2xl";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-[var(--color-ink)]/60 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
              width
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-[var(--color-ink)]">
                  {title}
                </h2>
                {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="tap-scale -mr-1.5 -mt-1 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[var(--color-ink)]"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 sm:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="md">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            tone === "danger" ? "bg-red-50 text-red-500" : "bg-[var(--color-sand)] text-[var(--color-gold)]"
          )}
        >
          {tone === "danger" ? <TriangleAlert className="h-5 w-5" aria-hidden /> : <RefreshCw className="h-5 w-5" aria-hidden />}
        </span>
        <div className="text-sm leading-relaxed text-neutral-600">{message}</div>
      </div>
      <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

export function Thumb({
  src,
  alt,
  className,
  icon: Icon = Inbox,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100", className)}>
      {src ? (
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <Icon className="h-4.5 w-4.5 text-neutral-400" aria-hidden />
      )}
    </div>
  );
}
