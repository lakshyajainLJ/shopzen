import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function Wishlist() {
  const { items, count } = useWishlist();

  // Normalize wishlist items to the shape ProductCard expects
  const normalized = items.map((p) => ({
    ...p,
    id: p.id || (p as any)._id,
    originalPrice: (p as any).originalPrice || Math.round(p.price * 1.25),
    rating: (p as any).rating || 4.0,
    reviews: (p as any).reviews || 0,
    inStock: true,
    category: (p as any).category || "",
    description: (p as any).description || "",
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="My Wishlist" subtitle={`${count} saved item(s)`} />
        {count === 0 ? (
          <EmptyState icon={Heart} title="Your wishlist is empty"
            subtitle="Click the heart icon on any product to save it here"
            actionLabel="Browse Products" actionHref="/products" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {normalized.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
