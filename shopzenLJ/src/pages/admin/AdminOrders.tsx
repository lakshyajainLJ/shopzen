import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, IndianRupee, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiAdminOrders } from "@/services/api";
import { toast } from "sonner";

const ORDER_STATUSES = ["pending","processing","packed","shipped","out","delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending:"Pending", processing:"Confirmed", packed:"Packed",
  shipped:"Shipped", out:"Out for Delivery", delivered:"Delivered",
};

function MiniTracker({ status }: { status: string }) {
  const idx = ORDER_STATUSES.indexOf(status as any);
  return (
    <div className="flex items-center justify-between my-3">
      {ORDER_STATUSES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i < idx ? "bg-green-500 text-white"
                : i === idx ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"}`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-[9px] mt-0.5 text-center hidden sm:block leading-tight max-w-[52px]
              ${i <= idx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {STATUS_LABELS[s]}
            </span>
          </div>
          {i < ORDER_STATUSES.length - 1 && (
            <div className={`flex-1 h-0.5 mx-0.5 ${i < idx ? "bg-green-500" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminOrders() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    apiAdminOrders()
      .then((data) => {
        setOrders(data);
        const s: Record<string, string> = {};
        data.forEach((o: any, i: number) => { s[o._id || i] = o.status || "pending"; });
        setStatuses(s);
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (oid: string, val: string) => {
    setStatuses((prev) => ({ ...prev, [oid]: val }));
    // Note: to persist this, add PUT /admin/orders/:id endpoint to Flask backend
    toast.success(`Status updated to "${STATUS_LABELS[val]}"`);
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const filtered = filter === "all" ? orders : orders.filter((o, i) => (statuses[o._id || i] || "pending") === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm flex items-center gap-1">
          <IndianRupee className="h-4 w-4" /> Total Revenue: ₹{totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
            onClick={() => setFilter(f)} className="capitalize">
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i=><Skeleton key={i} className="h-16 w-full rounded-lg"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o, i) => {
            const oid    = o._id || String(i);
            const status = statuses[oid] || "pending";
            const isOpen = expanded === oid;
            const date   = o.created_at
              ? new Date(o.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
              : "—";

            return (
              <Card key={oid} className="overflow-hidden">
                {/* Header */}
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <button className="flex items-center gap-3 text-left flex-1 min-w-0"
                    onClick={() => setExpanded(isOpen ? null : oid)}>
                    <div>
                      <p className="font-mono font-bold text-sm">#{oid.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{date} · {o.items?.length || 0} item(s)</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(o.user_name || o.user_email) && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <User className="h-3 w-3" /> {o.user_name || o.user_email}
                      </span>
                    )}

                    {/* Status dropdown */}
                    <Select value={status} onValueChange={(val) => updateStatus(oid, val)}>
                      <SelectTrigger className="h-8 text-xs w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {o.total_price && (
                      <span className="font-bold text-sm">₹{o.total_price.toLocaleString()}</span>
                    )}
                    <button onClick={() => setExpanded(isOpen ? null : oid)}>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t p-4 space-y-4">
                    <MiniTracker status={status} />

                    {/* Customer + Address */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <User className="h-3 w-3" /> Customer
                        </p>
                        <p className="text-sm font-medium">{o.user_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{o.user_email || "—"}</p>
                      </div>
                      {o.address && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Delivery Address
                          </p>
                          {o.address.name && <p className="text-sm font-medium">{o.address.name} · {o.address.phone}</p>}
                          <p className="text-xs text-muted-foreground">
                            {o.address.line1}{o.address.line2?`, ${o.address.line2}`:""}, {o.address.city}, {o.address.state} — {o.address.pincode}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {(o.items || []).map((item: any, j: number) => (
                        <div key={j} className="flex items-center gap-3 py-2 border-b last:border-0">
                          <img src={item.image || `https://picsum.photos/seed/${j+5}/40/40`}
                            className="h-10 w-10 rounded object-cover" alt=""
                            onError={(e)=>{(e.target as HTMLImageElement).src=`https://picsum.photos/seed/${j+5}/40/40`;}}/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.title || item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} · ₹{item.price?.toLocaleString()} each</p>
                          </div>
                          <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {o.payment_method && (
                      <p className="text-xs text-muted-foreground">
                        💳 Payment: <strong>{o.payment_method.toUpperCase()}</strong>
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
