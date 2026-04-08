import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Accepts both backend shape (_id, no originalPrice) and mock shape (id, originalPrice)
export function ProductCard({ product }: { product: any }) {
  const { toggle, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

  const id           = product._id || product.id;
  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const discount     = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const rating       = product.rating  || 4.0;
  const reviews      = product.reviews || 0;
  const wishlisted   = isWishlisted(id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(id, 1);
      setAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      toast.error("Could not add to cart");
    } finally { setAdding(false); }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({ id, name: product.name, price: product.price, image: product.image });
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️");
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/products/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image || `https://picsum.photos/seed/${id}/400/400`}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${id}/400/400`; }}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-md">
              {discount}% OFF
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-background"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-medium">{rating}</span>
            {reviews > 0 && <span className="text-xs text-muted-foreground">({reviews})</span>}
          </div>
          <h3 className="font-sans font-semibold text-sm line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-foreground">₹{product.price?.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button size="sm" className="w-full" variant={added ? "outline" : "default"}
          onClick={handleAdd} disabled={adding || added}>
          {added   ? <><Check className="h-4 w-4 mr-1" /> Added!</>
           : adding ? "Adding…"
           : <><ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart</>}
        </Button>
      </div>
    </Card>
  );
}

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-muted rounded animate-pulse w-16" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-9 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  );
}
