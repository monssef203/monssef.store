import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";

export default function CartToast() {
  const { lastAdded } = useCart();
  const product = lastAdded ? PRODUCTS.find((p) => p.id === lastAdded) : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-4 sm:top-20">
      <AnimatePresence>
        {product && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-sm text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-gold-light)]" />
            <span className="font-medium">Ajouté au panier</span>
            <span className="hidden text-neutral-300 sm:inline">— {product.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
