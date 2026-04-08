import { useState, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { apiAdminUsers } from "@/services/api";

export default function AdminUsers() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    apiAdminUsers()
      .then((data) => setUsers(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm">{users.length} registered users</p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Could not load users. Make sure <code className="bg-yellow-100 px-1 rounded">GET /admin/users</code> exists in your Flask backend.
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..." className="pl-9" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [1,2,3,4].map(i=>(
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                ))
              : filtered.length === 0
                ? <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {users.length === 0 ? "No users yet." : "No users match your search."}
                    </TableCell>
                  </TableRow>
                : filtered.map((u, i) => (
                  <TableRow key={u._id || u.id || i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {(u.name || u.email || "U")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{u.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{u.order_count ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {u.role || "user"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
