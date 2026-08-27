import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Order } from "../types";

const STORAGE_KEY = "monstore_last_order_v1";

interface OrderContextValue {
  lastOrder: Order | null;
  saveOrder: (order: Order) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

function readStorage(): Order | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lastOrder, setLastOrder] = useState<Order | null>(() => readStorage());

  const saveOrder = useCallback((order: Order) => {
    setLastOrder(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, []);

  return <OrderContext.Provider value={{ lastOrder, saveOrder }}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
