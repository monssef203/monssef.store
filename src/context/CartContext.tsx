import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "../types";
import { PRODUCTS } from "../data/products";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../config/config";

const STORAGE_KEY = "monstore_cart_v1";

interface CartContextValue {
  items: CartItem[];
  cartProducts: { product: Product; quantity: number }[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  lastAdded: string | null;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStorage());
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { productId, quantity }];
    });
    setLastAdded(productId);
    window.setTimeout(() => setLastAdded((cur) => (cur === productId ? null : cur)), 1800);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const cartProducts = useMemo(
    () =>
      items
        .map((i) => {
          const product = PRODUCTS.find((p) => p.id === i.productId);
          return product ? { product, quantity: i.quantity } : null;
        })
        .filter((v): v is { product: Product; quantity: number } => v !== null),
    [items]
  );

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => cartProducts.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0),
    [cartProducts]
  );
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  }, [subtotal]);
  const total = subtotal + shipping;

  const value: CartContextValue = {
    items,
    cartProducts,
    totalItems,
    subtotal,
    shipping,
    total,
    lastAdded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
