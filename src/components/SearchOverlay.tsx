import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { formatPrice } from "../config/config";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const goToCatalogue = () => {
    if (!query.trim()) return;
    navigate(`/catalogue?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-ink)]/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto mt-0 max-h-screen w-full overflow-y-auto bg-white shadow-xl sm:mt-0">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 shrink-0 text-neutral-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToCatalogue()}
              placeholder="Rechercher une montre, une collection..."
              aria-label="Rechercher un produit"
              className="w-full border-none bg-transparent py-2 text-base text-[var(--color-ink)] placeholder:text-neutral-400 focus:outline-none sm:text-lg"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 border-t border-neutral-100 pt-4">
            {query.trim() && results.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm text-neutral-500">
                  Aucun résultat pour <span className="font-medium text-[var(--color-ink)]">“{query}”</span>
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm font-medium text-[var(--color-gold)] underline underline-offset-4"
                >
                  Effacer la recherche
                </button>
              </div>
            )}

            {results.length > 0 && (
              <ul className="divide-y divide-neutral-100">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        navigate(`/product/${p.slug}`);
                        onClose();
                      }}
                      className="flex w-full items-center gap-4 py-3 text-left hover:bg-neutral-50"
                    >
                      <img src={p.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wide text-neutral-400">{p.category}</p>
                        <p className="truncate font-display text-base text-[var(--color-ink)]">{p.name}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[var(--color-ink)]">{formatPrice(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.trim() && results.length > 0 && (
              <button
                onClick={goToCatalogue}
                className="mt-2 w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                Voir tous les résultats pour “{query}”
              </button>
            )}

            {!query.trim() && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Recherches populaires</p>
                <div className="flex flex-wrap gap-2">
                  {["Automatique", "Femme", "Sport", "Minimaliste", "Cuir"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
