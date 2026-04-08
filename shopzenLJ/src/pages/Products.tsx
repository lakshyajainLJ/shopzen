import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard, SkeletonCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Search, PackageOpen } from "lucide-react";
import { apiGetProducts } from "@/services/api";

const CATEGORIES = ["All", "Electronics", "Fashion", "Watches", "Bags", "Accessories"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  // Load products from backend
  useEffect(() => {
    apiGetProducts()
      .then((data) => {
        // Normalize _id → id for compatibility
        const normalized = data.map((p: any) => ({ ...p, id: p._id || p.id }));
        setProducts(normalized);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Sync URL search param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const matchedCat = CATEGORIES.find((c) => c.toLowerCase() === q.toLowerCase());
      if (matchedCat && matchedCat !== "All") { setCategory(matchedCat); setSearch(""); }
      else { setSearch(q); setCategory("All"); }
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-low":  result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name":       result.sort((a, b) => a.name?.localeCompare(b.name)); break;
    }
    return result;
  }, [products, category, search, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="All Products" subtitle={`${filtered.length} products found`} />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm"
              onClick={() => { setCategory(cat); setSearchParams(cat === "All" ? {} : { q: cat }); }}>
              {cat}
            </Button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..." className="pl-9" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={PackageOpen} title="No products found"
            subtitle={products.length === 0
              ? "No products in the database yet. Add some from the Admin Panel."
              : "Try adjusting your search or category filter"} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
