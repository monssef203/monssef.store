import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterPanel, { type Filters } from "./FilterPanel";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

export default function FilterDrawer({ open, onClose, filters, onChange, onReset, resultCount }: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/50 lg:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Filtres produits"
            className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[88vh] flex-col rounded-t-2xl bg-white shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <span className="font-display text-lg text-[var(--color-ink)]">Filtres</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer les filtres"
                className="tap-scale flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FilterPanel filters={filters} onChange={onChange} onReset={onReset} />
            </div>
            <div className="border-t border-neutral-100 p-4 safe-bottom">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-medium text-white"
              >
                Voir {resultCount} résultat{resultCount > 1 ? "s" : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
