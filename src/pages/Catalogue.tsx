import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import Breadcrumbs from "../components/Breadcrumbs";
import EmptyState from "../components/EmptyState";
import FilterPanel, { DEFAULT_FILTERS, type Filters } from "../components/FilterPanel";
import FilterDrawer from "../components/FilterDrawer";
import Reveal from "../components/Reveal";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "best-selling";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "En vedette" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "best-selling", label: "Meilleures ventes" },
];

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");
    if (!category && !collection) return;
    setFilters((prev) => ({
      ...prev,
      categories: category ? [category] : prev.categories,
      collections: collection ? [collection] : prev.collections,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("category"), searchParams.get("collection")]);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length) list = list.filter((p) => filters.categories.includes(p.category));
    if (filters.collections.length) list = list.filter((p) => filters.collections.includes(p.collection));
    if (filters.movements.length) list = list.filter((p) => filters.movements.includes(p.movement));
    if (filters.materials.length) list = list.filter((p) => filters.materials.includes(p.material));
    if (filters.colors.length) list = list.filter((p) => filters.colors.includes(p.color));
    if (filters.inStockOnly) list = list.filter((p) => p.inStock);
    list = list.filter((p) => p.price <= filters.maxPrice);

    switch (sort) {
      case "newest":
        list = list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "best-selling":
        list = list.filter((p) => p.isBestSeller).concat(list.filter((p) => !p.isBestSeller));
        break;
      default:
        break;
    }

    return list;
  }, [query, filters, sort]);

  const activeFilterCount =
    filters.categories.length +
    filters.collections.length +
    filters.movements.length +
    filters.materials.length +
    filters.colors.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.maxPrice < DEFAULT_FILTERS.maxPrice ? 1 : 0);

  const clearSearch = () => {
    searchParams.delete("q");
    setSearchParams(searchParams);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Catalogue" }]} />

      <div className="mt-4 flex flex-col gap-2 sm:mt-6">
        <h1 className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">Catalogue</h1>
        <p className="text-sm text-neutral-500">
          {filteredProducts.length} montre{filteredProducts.length > 1 ? "s" : ""}
          {query ? (
            <>
              {" "}
              pour <span className="font-medium text-[var(--color-ink)]">“{query}”</span>{" "}
              <button onClick={clearSearch} className="ml-1 text-[var(--color-gold)] underline underline-offset-4">
                effacer
              </button>
            </>
          ) : null}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-y border-neutral-200 py-3 sm:mt-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="tap-scale flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-[var(--color-ink)] lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="hidden text-sm text-neutral-500 lg:block">
          {activeFilterCount > 0 ? `${activeFilterCount} filtre(s) actif(s)` : "Tous les produits"}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-neutral-500 sm:inline">Trier par</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-[var(--color-ink)] focus:border-[var(--color-gold)] focus:outline-none"
            aria-label="Trier les produits"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        </aside>

        <div>
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {[...filters.categories, ...filters.collections, ...filters.movements, ...filters.materials, ...filters.colors].map(
                (tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-[var(--color-sand)] px-3 py-1 text-xs font-medium text-[var(--color-ink)]"
                  >
                    {tag}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          categories: prev.categories.filter((v) => v !== tag),
                          collections: prev.collections.filter((v) => v !== tag),
                          movements: prev.movements.filter((v) => v !== tag),
                          materials: prev.materials.filter((v) => v !== tag),
                          colors: prev.colors.filter((v) => v !== tag),
                        }))
                      }
                      aria-label={`Retirer le filtre ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Aucun produit trouvé"
              description="Essayez d'ajuster vos filtres ou votre recherche pour découvrir nos autres montres."
              action={
                <button
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    clearSearch();
                  }}
                  className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-sm font-medium text-white"
                >
                  Réinitialiser
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, i) => (
                <Reveal key={product.id} delay={(i % 8) * 40}>
                  <ProductCard product={product} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        resultCount={filteredProducts.length}
      />
    </div>
  );
}
