import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { apiGetOrders } from "@/services/api";

const ORDER_STATUSES = ["pending", "processing", "packed", "shipped", "out", "delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed", processing: "Confirmed",
  packed: "Packed", shipped: "Shipped",
  out: "Out for Delivery", delivered: "Delivered",
};

function DeliveryTracker({ status }: { status: string }) {
  const currentIdx = ORDER_STATUSES.indexOf(status as any);
  return (
    <div className="flex items-center justify-between my-4">
      {ORDER_STATUSES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold
              ${i < currentIdx ? "bg-green-500 text-white"
                : i === currentIdx ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"}`}>
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center hidden sm:block max-w-[56px] leading-tight
              ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {STATUS_LABELS[s]}
            </span>
          </div>
          {i < ORDER_STATUSES.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-green-500" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    apiGetOrders()
      .then((data) => setOrders([...data].reverse()))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="My Orders" subtitle="" />
        <div className="space-y-4 max-w-3xl">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      </main>
      <Footer />
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <EmptyState icon={Package} title="No orders yet"
          subtitle="Start shopping and your orders will appear here"
          actionLabel="Shop Now" actionHref="/products" />
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="My Orders" subtitle={`${orders.length} order(s)`} />
        <div className="space-y-4 max-w-3xl">
          {orders.map((order, idx) => {
            const oid    = order._id || order.id || String(idx);
            const status = order.status || "pending";
            const date   = order.created_at
              ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "—";
            const isOpen = expanded === oid;

            return (
              <Card key={oid} className="overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setExpanded(isOpen ? null : oid)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">#{oid.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{date} · {order.items?.length || 0} item(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status === "delivered" ? "default" : "secondary"} className="capitalize">
                      {STATUS_LABELS[status] || status}
                    </Badge>
                    {order.total_price && (
                      <span className="font-bold text-sm">₹{order.total_price.toLocaleString()}</span>
                    )}
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t p-4 space-y-4">
                    {/* Tracker */}
                    <DeliveryTracker status={status} />

                    {/* Address */}
                    {order.address && (
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                        {order.address.name && (
                          <p className="text-sm font-medium">{order.address.name} · {order.address.phone}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""},{" "}
                          {order.address.city}, {order.address.state} — {order.address.pincode}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <img
                            src={item.image || `https://picsum.photos/seed/${i + 10}/48/48`}
                            alt={item.title || item.name}
                            className="h-12 w-12 rounded-md object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i + 10}/48/48`; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.title || item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t text-sm">
                      {order.payment_method && (
                        <span className="text-muted-foreground">Payment: {order.payment_method}</span>
                      )}
                      {order.total_price && (
                        <span className="font-bold">Total: ₹{order.total_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
