import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Credentials from .env — set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD
const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || "admin@shopzen.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

export default function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // small UX delay
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("shopzen_admin", "true");
      toast.success("Welcome, Admin! 👋");
      navigate("/admin");
    } else {
      toast.error("Invalid admin credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Restricted — administrators only</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopzen.com" required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In as Admin"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Default: <strong>admin@shopzen.com</strong> / <strong>admin123</strong><br/>
            Change via <code className="bg-muted px-1 rounded">VITE_ADMIN_EMAIL</code> in <code className="bg-muted px-1 rounded">.env</code>
          </p>
          <div className="text-center mt-3">
            <a href="/" className="text-xs text-muted-foreground hover:underline">← Back to Store</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
