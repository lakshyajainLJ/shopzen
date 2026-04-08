import { useState } from "react";
import { User, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Address {
  type: "home" | "work" | "other";
  name: string; phone: string; line1: string;
  line2: string; city: string; state: string; pincode: string;
}

const EMPTY_ADDR: Address = { type: "home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function Profile() {
  const { user } = useAuth();
  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const s = localStorage.getItem("shopzen_addresses");
    return s ? JSON.parse(s) : [];
  });
  const [editIdx,      setEditIdx]      = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm,     setAddrForm]     = useState<Address>(EMPTY_ADDR);
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");

  const saveProfile = () => toast.success("Profile info saved locally!");

  const saveAddress = () => {
    if (!addrForm.name || !addrForm.line1 || !addrForm.city) {
      toast.error("Please fill required fields"); return;
    }
    const updated = editIdx !== null
      ? addresses.map((a, i) => i === editIdx ? addrForm : a)
      : [...addresses, addrForm];
    setAddresses(updated);
    localStorage.setItem("shopzen_addresses", JSON.stringify(updated));
    setShowAddrForm(false); setEditIdx(null); setAddrForm(EMPTY_ADDR);
    toast.success("Address saved!");
  };

  const deleteAddress = (idx: number) => {
    const updated = addresses.filter((_, i) => i !== idx);
    setAddresses(updated);
    localStorage.setItem("shopzen_addresses", JSON.stringify(updated));
    toast.success("Address removed");
  };

  const changePassword = () => {
    if (!newPw || newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    // Password change requires a dedicated backend endpoint — inform user
    toast.info("Password change requires backend /profile/password endpoint. Contact admin.");
    setNewPw(""); setConfirmPw("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 max-w-2xl">
        <PageHeader title="My Profile" />

        {/* Avatar strip */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/40 rounded-lg">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name || "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
            {user?.role === "admin" && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">Admin</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile"   className="flex-1"><User   className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
            <TabsTrigger value="addresses" className="flex-1"><MapPin className="h-4 w-4 mr-1" /> Addresses</TabsTrigger>
            <TabsTrigger value="security"  className="flex-1"><Shield className="h-4 w-4 mr-1" /> Security</TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <Card className="p-6 space-y-4">
              <div className="space-y-2"><Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              <Button onClick={saveProfile}>Save Changes</Button>
            </Card>
          </TabsContent>

          {/* Addresses tab */}
          <TabsContent value="addresses">
            <Card className="p-6">
              {!showAddrForm ? (
                <div className="space-y-4">
                  {addresses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No saved addresses yet</p>
                  )}
                  {addresses.map((a, i) => (
                    <div key={i} className="border rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold uppercase bg-muted px-2 py-0.5 rounded-full">{a.type}</span>
                        <p className="font-medium text-sm mt-1">{a.name} · {a.phone}</p>
                        <p className="text-sm text-muted-foreground">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditIdx(i); setAddrForm(a); setShowAddrForm(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAddress(i)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => { setEditIdx(null); setAddrForm(EMPTY_ADDR); setShowAddrForm(true); }}>
                    + Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(["home", "work", "other"] as const).map((t) => (
                      <Button key={t} variant={addrForm.type === t ? "default" : "outline"} size="sm"
                        onClick={() => setAddrForm({ ...addrForm, type: t })} className="capitalize">{t}</Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Name *</Label><Input value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone *</Label><Input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} /></div>
                    <div className="space-y-2 col-span-2"><Label>Address Line 1 *</Label><Input value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} /></div>
                    <div className="space-y-2 col-span-2"><Label>Address Line 2</Label><Input value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} /></div>
                    <div className="space-y-2"><Label>City *</Label><Input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                    <div className="space-y-2"><Label>State *</Label><Input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Pincode *</Label><Input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setShowAddrForm(false); setEditIdx(null); }}>Cancel</Button>
                    <Button onClick={saveAddress}>Save Address</Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Security tab */}
          <TabsContent value="security">
            <Card className="p-6 space-y-4">
              <div className="space-y-2"><Label>New Password</Label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} /></div>
              <Button onClick={changePassword} disabled={!newPw || !confirmPw}>Change Password</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
