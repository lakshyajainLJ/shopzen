import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Truck, Shield, RotateCcw, Clock, Award, ShoppingBag, Package, Heart as HeartIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard, SkeletonCard } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { apiGetProducts, apiGetOrders } from "@/services/api";

const categoryTiles = [
  { name: "Fashion",     image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300" },
  { name: "Electronics", image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300" },
  { name: "Watches",     image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300" },
  { name: "Bags",        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300" },
];

const testimonials = [
  { name: "Arjun M.",  text: "Amazing quality products! Delivery was super fast. Will definitely shop again.", rating: 5, avatar: "A" },
  { name: "Sneha R.",  text: "Love the variety and the prices are unbeatable. Customer service is top notch!", rating: 5, avatar: "S" },
  { name: "Vikram P.", text: "Best online shopping experience I've had. The product quality exceeded my expectations.", rating: 4, avatar: "V" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [products,    setProducts]    = useState<any[]>([]);
  const [userOrders,  setUserOrders]  = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Load products from backend
  useEffect(() => {
    apiGetProducts()
      .then((data) => setProducts(data.map((p: any) => ({ ...p, id: p._id || p.id }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load user orders if logged in
  useEffect(() => {
    if (!isAuthenticated) { setUserOrders([]); return; }
    apiGetOrders()
      .then((data) => setUserOrders(data))
      .catch(() => setUserOrders([]));
  }, [isAuthenticated]);

  const featured   = products.slice(0, 8);
  const latest     = products.slice(8, 16);
  const lastOrder  = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container py-8 md:py-14">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-fade-in">
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">Premium Shopping</span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-2 leading-tight">
                  Discover Your <span className="text-accent">Style</span>
                </h1>
                <p className="mt-4 text-muted-foreground text-lg max-w-lg">
                  Explore curated collections of premium products at prices you'll love. Free delivery on all orders.
                </p>
                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button size="lg" onClick={() => navigate("/products")}>
                    Shop Now <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/products?q=Electronics")}>
                    Explore Electronics
                  </Button>
                </div>
                <div className="flex gap-6 mt-8 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">4.8 Rating</p>
                      <p className="text-xs text-muted-foreground">5000+ reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Free Delivery</p>
                      <p className="text-xs text-muted-foreground">On all orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── DASHBOARD WIDGET ─────────────────── */}
              <Card className="p-6 animate-scale-in">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                        {(user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold">Welcome back, {user?.name?.split(" ")[0]}!</h3>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted rounded-lg p-3 text-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate("/orders")}>
                        <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{userOrders.length}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate("/wishlist")}>
                        <HeartIcon className="h-5 w-5 mx-auto mb-1 text-destructive" />
                        <p className="text-2xl font-bold">{wishlistCount}</p>
                        <p className="text-xs text-muted-foreground">Wishlist</p>
                      </div>
                    </div>

                    {lastOrder && (
                      <div className="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate("/orders")}>
                        <p className="text-xs text-muted-foreground mb-1">Last Order</p>
                        <p className="font-semibold text-sm">#{String(lastOrder._id || "").slice(-8).toUpperCase()}</p>
                        <span className="text-xs capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {lastOrder.status || "pending"}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/orders"><Button variant="outline" size="sm" className="w-full"><Package className="h-3 w-3 mr-1"/>Orders</Button></Link>
                      <Link to="/wishlist"><Button variant="outline" size="sm" className="w-full"><HeartIcon className="h-3 w-3 mr-1"/>Wishlist</Button></Link>
                      <Link to="/profile"><Button variant="outline" size="sm" className="w-full">Profile</Button></Link>
                      <Link to="/cart"><Button variant="outline" size="sm" className="w-full"><ShoppingBag className="h-3 w-3 mr-1"/>Cart</Button></Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-display text-xl font-semibold">Why ShopZen?</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Truck,     text: "Free delivery on all orders" },
                        { icon: Shield,    text: "100% secure payments" },
                        { icon: RotateCcw, text: "Easy 30-day returns" },
                        { icon: Award,     text: "Top quality products" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm">{text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-2">
                      <Link to="/login"><Button className="w-full">Login</Button></Link>
                      <Link to="/register"><Button variant="outline" className="w-full">Create Account</Button></Link>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ─────────────────────────────── */}
        <section className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryTiles.map((cat) => (
              <Link key={cat.name} to={`/products?q=${cat.name}`}
                className="group relative aspect-square rounded-lg overflow-hidden">
                <img src={cat.image} alt={cat.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-4">
                  <span className="text-primary-foreground font-semibold">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ──────────────────────── */}
        <section className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.length === 0
                ? <div className="col-span-full text-center py-12 text-muted-foreground">
                    No products yet. <Link to="/admin/products" className="text-primary underline">Add from Admin Panel →</Link>
                  </div>
                : featured.map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* ── PROMO BANNER ───────────────────────────── */}
        <section className="bg-primary text-primary-foreground">
          <div className="container py-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">Limited Time</span>
                <h2 className="font-display text-3xl font-bold mt-2">Premium Watches Collection</h2>
                <p className="mt-3 opacity-80">
                  Discover our exclusive range of luxury timepieces. Up to 40% off on selected watches.
                </p>
                <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/products?q=Watches")}>
                  Shop Watches
                </Button>
              </div>
              <div className="flex justify-center">
                <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400"
                  alt="Watches Collection" className="rounded-lg shadow-2xl max-w-xs" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ── LATEST PRODUCTS ────────────────────────── */}
        {(loading || latest.length > 0) && (
          <section className="container py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Latest Arrivals</h2>
              <Link to="/products">
                <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : latest.map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </section>
        )}

        {/* ── TRUST STRIP ────────────────────────────── */}
        <section className="bg-primary text-primary-foreground py-5">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Truck,    text: "Free Delivery" },
                { icon: Shield,   text: "Secure Pay" },
                { icon: RotateCcw,text: "Easy Returns" },
                { icon: Clock,    text: "24/7 Support" },
                { icon: Award,    text: "Top Quality" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center justify-center gap-2">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────── */}
        <section className="container py-8">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── BRAND LOGOS ────────────────────────────── */}
        <section className="container py-8 border-t">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40">
            {["Nike", "Puma", "Adidas", "Samsung", "Apple", "Sony"].map((brand) => (
              <span key={brand} className="text-2xl font-display font-bold text-foreground">{brand}</span>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
