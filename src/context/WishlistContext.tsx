import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../types";
import { PRODUCTS } from "../data/products";

const STORAGE_KEY = "monstore_wishlist_v1";

interface WishlistContextValue {
  ids: string[];
  products: Product[];
  count: number;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => readStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }, []);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);

  const products = useMemo(() => ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p), [ids]);

  const value: WishlistContextValue = { ids, products, count: ids.length, toggle, remove, isWishlisted };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
