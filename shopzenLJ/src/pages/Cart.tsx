import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, loading } = useCart();

  const discount   = Math.round(totalPrice * 0.2);
  const finalTotal = totalPrice - discount;

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="Shopping Cart" subtitle="" />
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
      </main>
      <Footer />
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <EmptyState icon={ShoppingBag} title="Your cart is empty"
          subtitle="Add products to your cart and they'll show up here"
          actionLabel="Continue Shopping" actionHref="/products" />
      </main>
      <Footer />
    </div>
  );

  const handleRemove = async (productId: string, name: string) => {
    await removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  const handleUpdate = async (productId: string, qty: number) => {
    await updateQuantity(productId, qty);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="Shopping Cart" subtitle={`${items.length} item(s) in your cart`} />
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product_id} className="p-4 flex gap-4">
                <Link to={`/products/${item.product_id}`}>
                  <img
                    src={item.image || `https://picsum.photos/seed/${item.product_id}/100/100`}
                    alt={item.title}
                    className="h-24 w-24 rounded-md object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.product_id}/100/100`; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="font-semibold text-sm hover:underline line-clamp-1">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">₹{item.price?.toLocaleString()} each</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => handleUpdate(item.product_id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => handleUpdate(item.product_id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => handleRemove(item.product_id, item.title)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="font-bold whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="p-6 h-fit sticky top-20">
            <h3 className="font-display text-lg font-semibold mb-4">Price Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">MRP Total</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount (20%)</span><span>-₹{discount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-green-600">FREE</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span><span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-green-50 text-green-700 text-sm font-medium rounded-md p-3 mt-4 text-center">
              You save ₹{discount.toLocaleString()} on this order!
            </div>
            <Link to="/checkout" className="block mt-4">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link to="/products" className="block mt-2 text-center">
              <Button variant="ghost" size="sm">Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
