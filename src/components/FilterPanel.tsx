import { CATEGORIES, COLLECTIONS, MOVEMENTS, MATERIALS, COLORS } from "../data/products";
import { cn } from "../utils/cn";

export interface Filters {
  categories: string[];
  collections: string[];
  movements: string[];
  materials: string[];
  colors: string[];
  inStockOnly: boolean;
  maxPrice: number;
}

export const DEFAULT_MAX_PRICE = 2200;

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  collections: [],
  movements: [],
  materials: [],
  colors: [],
  inStockOnly: false,
  maxPrice: DEFAULT_MAX_PRICE,
};

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="border-b border-neutral-100 py-5 first:pt-0">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{title}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-[var(--color-ink)]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-display text-xl text-[var(--color-ink)]">Filtres</h3>
        <button type="button" onClick={onReset} className="text-xs font-medium text-[var(--color-gold)] underline underline-offset-4">
          Réinitialiser
        </button>
      </div>

      <div className="border-b border-neutral-100 py-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Prix maximum</h4>
          <span className="text-xs font-medium text-[var(--color-ink)]">{filters.maxPrice} DH</span>
        </div>
        <input
          type="range"
          min={500}
          max={DEFAULT_MAX_PRICE}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="mt-3 w-full accent-[var(--color-gold)]"
          aria-label="Filtrer par prix maximum"
        />
      </div>

      <FilterGroup
        title="Catégorie"
        options={CATEGORIES}
        selected={filters.categories}
        onToggle={(v) => onChange({ ...filters, categories: toggleValue(filters.categories, v) })}
      />
      <FilterGroup
        title="Collection"
        options={COLLECTIONS}
        selected={filters.collections}
        onToggle={(v) => onChange({ ...filters, collections: toggleValue(filters.collections, v) })}
      />
      <FilterGroup
        title="Mouvement"
        options={MOVEMENTS}
        selected={filters.movements}
        onToggle={(v) => onChange({ ...filters, movements: toggleValue(filters.movements, v) })}
      />
      <FilterGroup
        title="Matière"
        options={MATERIALS}
        selected={filters.materials}
        onToggle={(v) => onChange({ ...filters, materials: toggleValue(filters.materials, v) })}
      />
      <FilterGroup
        title="Couleur"
        options={COLORS}
        selected={filters.colors}
        onToggle={(v) => onChange({ ...filters, colors: toggleValue(filters.colors, v) })}
      />

      <div className="flex items-center justify-between py-5">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Disponibilité</h4>
        <button
          type="button"
          role="switch"
          aria-checked={filters.inStockOnly}
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            filters.inStockOnly ? "bg-[var(--color-ink)]" : "bg-neutral-200"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              filters.inStockOnly ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
