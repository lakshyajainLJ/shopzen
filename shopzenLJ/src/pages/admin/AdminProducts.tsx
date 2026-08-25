import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiAdminGenerateDescription } from "@/services/api";
import { toast } from "sonner";
import { Product } from "@/types";

const EMPTY_FORM = { name: "", price: "", description: "", image: "", category: "", stock: "100" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiGetProducts(1, 100)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list.map((p: any) => ({ ...p, id: p._id || p.id, name: p.name || p.title })));
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name || p.title || "",
      price: String(p.price || 0),
      description: p.description || "",
      image: p.image || "",
      category: p.category || "",
      stock: String(p.stock ?? 100)
    });
    setDialogOpen(true);
  };

  const handleGenerateAIDescription = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await apiAdminGenerateDescription({ name: form.name, category: form.category });
      setForm((prev) => ({ ...prev, description: res.description }));
      toast.success("AI Description draft generated! Review and edit before saving.");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI description");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and Price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        category: form.category || "General",
        stock: Number(form.stock) || 100
      };
      if (editing) {
        await apiUpdateProduct(editing.id, payload);
        toast.success("Product updated!");
      } else {
        await apiCreateProduct(payload);
        toast.success("Product added!");
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await apiDeleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = search
    ? products.filter((p) => (p.name || p.title || "").toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">{products.length} products in store</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {products.length === 0 ? "No products yet. Add your first product!" : "No products match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || `https://picsum.photos/seed/${p.id}/40/40`}
                        alt={p.name}
                        className="h-10 w-10 rounded object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${p.id}/40/40`; }}
                      />
                      <div>
                        <p className="font-medium text-sm">{p.name || p.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.category || "General"}</TableCell>
                  <TableCell className="text-sm font-medium">{p.stock ?? 100}</TableCell>
                  <TableCell className="font-bold">₹{p.price?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id, p.name || p.title || "")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="iPhone 15 Pro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="79999"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Electronics, Fashion, Footwear…"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIDescription}
                  disabled={generatingAI || !form.name.trim()}
                  className="h-7 text-xs gap-1 border-amber-300 text-amber-600 hover:bg-amber-50"
                >
                  {generatingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Generate AI Description
                </Button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short product description"
                className="w-full h-24 p-2 text-sm border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…/image.jpg"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editing ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
