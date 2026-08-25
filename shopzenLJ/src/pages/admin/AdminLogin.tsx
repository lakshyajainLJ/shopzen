import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome, Admin! 👋");
        navigate("/admin");
      } else {
        toast.error(res.message || "Invalid admin credentials");
      }
    } catch (err: any) {
      toast.error(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Restricted — authenticated administrators only</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopzen.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying Credentials…" : "Sign In as Admin"}
            </Button>
          </form>
          <div className="text-center mt-4">
            <a href="/" className="text-xs text-muted-foreground hover:underline">← Back to Store</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
