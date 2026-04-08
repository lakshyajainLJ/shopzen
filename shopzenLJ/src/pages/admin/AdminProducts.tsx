import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from "@/services/api";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", price: "", description: "", image: "", category: "" };

export default function AdminProducts() {
  const [products,    setProducts]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editing,     setEditing]     = useState<any | null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiGetProducts()
      .then((data) => setProducts(data.map((p: any) => ({ ...p, id: p._id || p.id }))))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), description: p.description || "", image: p.image || "", category: p.category || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error("Name and Price are required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, price: Number(form.price), description: form.description, image: form.image, category: form.category };
      if (editing) {
        await apiUpdateProduct(editing.id || editing._id, payload);
        toast.success("Product updated!");
      } else {
        await apiCreateProduct(payload);
        toast.success("Product added!");
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally { setSaving(false); }
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
    } finally { setDeletingId(null); }
  };

  const filtered = search
    ? products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
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
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..." className="pl-9" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [1,2,3,4].map(i=>(
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
                ))
              : filtered.length === 0
                ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {products.length === 0 ? "No products yet. Add your first product!" : "No products match your search."}
                  </TableCell></TableRow>
                : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.image || `https://picsum.photos/seed/${p.id}/40/40`} alt={p.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={(e)=>{(e.target as HTMLImageElement).src=`https://picsum.photos/seed/${p.id}/40/40`;}}/>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.category || "—"}</TableCell>
                    <TableCell className="font-bold">₹{p.price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="iPhone 15 Pro" /></div>
            <div className="space-y-2"><Label>Price (₹) *</Label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="79999" /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics, Fashion, Watches…" /></div>
            <div className="space-y-2"><Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short product description" /></div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…/image.jpg" />
              {form.image && (
                <img src={form.image} alt="Preview" className="h-24 w-24 rounded object-cover mt-2"
                  onError={(e)=>{(e.target as HTMLImageElement).style.display="none";}}/>
              )}
            </div>
            <div className="flex justify-end gap-3">
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
