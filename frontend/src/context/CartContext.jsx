import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "relaptop_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      const maxQty = product.stock;
      if (existing) {
        const newQty = Math.min(existing.qty + qty, maxQty);
        return prev.map((i) => (i.product === product._id ? { ...i, qty: newQty } : i));
      }
      return [
        ...prev,
        {
          product: product._id,
          title: product.title,
          image: product.images[0],
          price: product.price,
          stock: product.stock,
          qty: Math.min(qty, maxQty),
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.product === productId ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const clearCart = () => setItems([]);

  const { itemsCount, itemsPrice } = useMemo(() => {
    return {
      itemsCount: items.reduce((acc, i) => acc + i.qty, 0),
      itemsPrice: items.reduce((acc, i) => acc + i.qty * i.price, 0),
    };
  }, [items]);

  const value = { items, addItem, updateQty, removeItem, clearCart, itemsCount, itemsPrice };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
