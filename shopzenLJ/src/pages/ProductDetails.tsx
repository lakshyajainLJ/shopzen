import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Minus, Plus, ShoppingCart, Check, ArrowLeft, Sparkles, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { apiGetProduct, apiAISummarizeReviews } from "@/services/api";
import { toast } from "sonner";
import { Product } from "@/types";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // AI Review Summary state
  const [aiSummary, setAiSummary] = useState<{ summary?: string; likes?: string[]; dislikes?: string[]; overall?: string } | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGetProduct(id)
      .then((data: any) => setProduct({ ...data, id: data._id || data.id, name: data.name || data.title }))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(false), 2200);
    } catch (err: any) {
      toast.error(err.message || "Could not add to cart");
    } finally { setAdding(false); }
  };

  const handleSummarizeReviews = async () => {
    if (!product) return;
    setSummarizing(true);
    try {
      const summaryData = await apiAISummarizeReviews(product.id);
      setAiSummary(summaryData);
      toast.success("AI review summary generated! ✨");
    } catch {
      toast.error("Failed to generate review summary");
    } finally {
      setSummarizing(false);
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    const wishlisted = isWishlisted(product.id);
    toggle({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/products"><Button variant="outline">Back to Products</Button></Link>
      </div>
      <Footer />
    </div>
  );

  const originalPrice = Math.round(product.price * 1.25);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const rating = 4.5;
  const wishlisted = isWishlisted(product.id);
  const stock = product.stock ?? 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.image || `https://picsum.photos/seed/${product.id}/600/600`}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/600/600`; }}
              />
            </div>
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold px-3 py-1 rounded-md text-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                {product.category && <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.category}</p>}
                <h1 className="font-display text-3xl font-bold mt-1">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleWishlist}>
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stars & Stock */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium ml-1">{rating}</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {stock > 0 ? `In Stock (${stock} left)` : "Out of Stock"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">₹{product.price?.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
              <span className="text-sm text-green-600 font-medium">Save ₹{(originalPrice - product.price).toLocaleString()}</span>
            </div>

            {product.description && <p className="text-muted-foreground">{product.description}</p>}

            {/* Perks */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center gap-1"><Truck className="h-5 w-5 text-accent" /><span>Free Delivery</span></div>
                <div className="flex flex-col items-center gap-1"><Shield className="h-5 w-5 text-accent" /><span>1 Year Warranty</span></div>
                <div className="flex flex-col items-center gap-1"><RotateCcw className="h-5 w-5 text-accent" /><span>Easy Returns</span></div>
              </div>
            </Card>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAdd}
                disabled={adding || added || stock < 1}
                variant={added ? "outline" : "default"}
              >
                {added ? <><Check className="h-4 w-4 mr-1" /> Added!</>
                  : adding ? "Adding…"
                  : stock < 1 ? "Out of Stock"
                  : <><ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart</>}
              </Button>
            </div>

            {/* AI Review Summarizer Section */}
            <Card className="p-4 bg-muted/30 border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-sm">AI Customer Review Summary</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSummarizeReviews}
                  disabled={summarizing}
                  className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {summarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Summarize Reviews"}
                </Button>
              </div>

              {aiSummary ? (
                <div className="space-y-3 text-xs">
                  <p className="text-muted-foreground">{aiSummary.summary}</p>
                  {aiSummary.likes && aiSummary.likes.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-1 text-green-700">
                        <ThumbsUp className="h-3 w-3" /> What Customers Like:
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {aiSummary.likes.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {aiSummary.dislikes && aiSummary.dislikes.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-1 text-red-700">
                        <ThumbsDown className="h-3 w-3" /> Common Complaints:
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {aiSummary.dislikes.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {aiSummary.overall && (
                    <p className="font-medium text-foreground pt-1 border-t">Overall: {aiSummary.overall}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click 'Summarize Reviews' to get AI-powered insights from customer feedback.
                </p>
              )}
            </Card>

            <Link to="/cart"><Button variant="outline" className="w-full">Go to Cart</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
