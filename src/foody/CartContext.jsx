import { createContext, useContext, useEffect, useState } from "react";
const CartContext = createContext(null);
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem("foody_cart");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("foody_cart", JSON.stringify(items));
  }, [items]);
  const addItem = (item) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...item, qty: 1 }];
    });
  };
  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
