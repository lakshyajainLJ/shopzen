import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WishlistProduct { id: string; name: string; price: number; image?: string; [key: string]: any; }

interface WishlistContextType {
  items: WishlistProduct[];
  toggle: (product: WishlistProduct) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>(() => {
    try { return JSON.parse(localStorage.getItem("shopzen_wishlist") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("shopzen_wishlist", JSON.stringify(items)); }, [items]);

  const toggle = (product: WishlistProduct) => {
    setItems(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const isWishlisted = (id: string) => items.some(p => p.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
