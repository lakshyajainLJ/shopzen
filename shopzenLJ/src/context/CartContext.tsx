import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGetCart, apiAddToCart, apiUpdateCart, apiRemoveCart } from "@/services/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  clearCart: () => void;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) { setItems([]); return; }
    try {
      setLoading(true);
      const data = await apiGetCart();
      setItems(data.items || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [isAuthenticated]);

  const addToCart = async (productId: string, qty = 1) => {
    await apiAddToCart(productId, qty);
    await fetchCart();
  };

  const removeFromCart = async (productId: string) => {
    await apiRemoveCart(productId);
    await fetchCart();
  };

  const updateQuantity = async (productId: string, qty: number) => {
    if (qty < 1) return removeFromCart(productId);
    await apiUpdateCart(productId, qty);
    await fetchCart();
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, loading, addToCart, removeFromCart, updateQuantity, clearCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
