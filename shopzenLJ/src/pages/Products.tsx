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
import { Search, PackageOpen, Sparkles, Loader2 } from "lucide-react";
import { apiGetProducts, apiAISemanticSearch } from "@/services/api";
import { Product } from "@/types";
import { toast } from "sonner";

const CATEGORIES = ["All", "Electronics", "Fashion", "Watches", "Bags", "Accessories", "Footwear"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [semanticSearching, setSemanticSearching] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setLoading(true);
    apiGetProducts(1, 100, category !== "All" ? category : undefined)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data.products || [];
        const normalized = list.map((p: any) => ({
          ...p,
          id: p.id || p._id,
          name: p.name || p.title || "Product"
        }));
        setProducts(normalized);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const matchedCat = CATEGORIES.find((c) => c.toLowerCase() === q.toLowerCase());
      if (matchedCat && matchedCat !== "All") {
        setCategory(matchedCat);
        setSearch("");
      } else {
        setSearch(q);
        setCategory("All");
      }
    }
  }, [searchParams]);

  const handleSemanticSearch = async () => {
    if (!search.trim()) return;
    setSemanticSearching(true);
    try {
      const results = await apiAISemanticSearch(
        search,
        category !== "All" ? category : undefined
      );
      setProducts(results);
      toast.success(`Found ${results.length} semantically relevant products! ✨`);
    } catch (err: any) {
      toast.error("Semantic search failed. Showing keyword matches.");
    } finally {
      setSemanticSearching(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== "All") {
      result = result.filter((p) => (p.category || "").toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.name || p.title || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-low":  result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name":       result.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
    }
    return result;
  }, [products, category, search, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="All Products" subtitle={`${filtered.length} product(s) available`} />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => { setCategory(cat); setSearchParams(cat === "All" ? {} : { q: cat }); }}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword or natural phrase..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSemanticSearch}
              disabled={semanticSearching || !search.trim()}
              variant="secondary"
              className="gap-1 text-xs"
            >
              {semanticSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              AI Vector Search
            </Button>
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
          <EmptyState
            icon={PackageOpen}
            title="No products found"
            subtitle={products.length === 0
              ? "No products in the database yet. Add some from the Admin Panel."
              : "Try adjusting your search or category filter"}
          />
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
