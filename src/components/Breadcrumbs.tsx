import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Fil d'ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
      <Link to="/" className="hover:text-[var(--color-ink)]">
        Accueil
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-neutral-300" />
          {item.to ? (
            <Link to={item.to} className="hover:text-[var(--color-ink)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
