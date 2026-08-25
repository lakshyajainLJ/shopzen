import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, IndianRupee, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGetProducts, apiAdminOrders, apiAdminUsers } from "@/services/api";
import { Product, Order, User } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", processing: "Confirmed", packed: "Packed",
  shipped: "Shipped", out: "Out for Delivery", delivered: "Delivered",
  PLACED: "Order Placed"
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([apiGetProducts(1, 100), apiAdminOrders(), apiAdminUsers()])
      .then(([p, o, u]) => {
        if (p.status === "fulfilled") {
          const val: any = p.value;
          setProducts(Array.isArray(val) ? val : val.products || []);
        }
        if (o.status === "fulfilled") setOrders(o.value);
        if (u.status === "fulfilled") setUsers(u.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || o.total_price || 0), 0);
  const pendingOrders = orders.filter((o) => {
    const st = (o.order_status || o.status || "pending").toLowerCase();
    return st === "pending" || st === "placed";
  });

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, link: "/admin/products", color: "text-blue-500" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, link: "/admin/orders", color: "text-green-500" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, link: "/admin/orders", color: "text-yellow-500" },
    { label: "Registered Users", value: users.length, icon: Users, link: "/admin/users", color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Pending alert */}
      {!loading && pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <span className="text-sm font-medium text-yellow-800">
            {pendingOrders.length} pending order(s) need attention
          </span>
          <Link to="/admin/orders" className="ml-auto text-xs text-yellow-700 underline">View →</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.link}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              {loading ? (
                <Skeleton className="h-7 w-20 mb-1" />
              ) : (
                <p className="text-2xl font-bold">{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-4">No orders yet</TableCell></TableRow>
              ) : (
                orders.slice(0, 6).map((o, i) => {
                  const oid = o.id || String(i + 1);
                  const st = o.order_status || o.status || "pending";
                  return (
                    <TableRow key={oid}>
                      <TableCell className="font-medium text-xs font-mono">#{oid.slice(-6).toUpperCase()}</TableCell>
                      <TableCell className="text-xs">{o.user_name || o.user_email || "—"}</TableCell>
                      <TableCell className="text-xs font-bold">₹{(o.total || o.total_price || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={st.toLowerCase() === "delivered" ? "default" : "secondary"} className="text-xs capitalize">
                          {STATUS_LABELS[st] || st}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Recent Products */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Products</h3>
            <Link to="/admin/products" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-4">No products yet</TableCell></TableRow>
              ) : (
                products.slice(0, 6).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image || `https://picsum.photos/seed/${p.id}/36/36`}
                          alt={p.name}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className="text-xs font-medium line-clamp-1">{p.name || p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold">₹{p.price?.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
