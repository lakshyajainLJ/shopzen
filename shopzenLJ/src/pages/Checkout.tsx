import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Home, Briefcase, MapPin, CreditCard, Banknote, Smartphone, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiPlaceOrder } from "@/services/api";
import { toast } from "sonner";

const steps = ["Address", "Payment", "Review"];
const addressTypes = [
  { value: "home",  label: "Home",  icon: Home },
  { value: "work",  label: "Work",  icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];
const paymentMethods = [
  { value: "Cash on Delivery", icon: Banknote },
  { value: "UPI",              icon: Smartphone },
  { value: "Credit/Debit Card",icon: CreditCard },
  { value: "Net Banking",      icon: Building2 },
];

interface Address {
  type: "home" | "work" | "other";
  name: string; phone: string; line1: string;
  line2: string; city: string; state: string; pincode: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  const savedAddr = localStorage.getItem("shopzen_address");
  const [address, setAddress] = useState<Address>(
    savedAddr ? JSON.parse(savedAddr) : { type: "home", name: user?.name || "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" }
  );
  const [payment, setPayment] = useState("Cash on Delivery");

  const discount   = Math.round(totalPrice * 0.2);
  const finalTotal = totalPrice - discount;

  const addrValid = address.name && address.phone && address.line1 && address.city && address.state && address.pincode;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      localStorage.setItem("shopzen_address", JSON.stringify(address));
      await apiPlaceOrder({ address, payment_method: payment });
      clearCart();
      setSuccess(true);
      toast.success("Order placed successfully! 🎉");
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Could not place order. Please try again.");
    } finally { setPlacing(false); }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
        <h2 className="font-display text-3xl font-bold">Order Placed!</h2>
        <p className="text-muted-foreground">Redirecting to your orders…</p>
      </main>
      <Footer />
    </div>
  );

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <PageHeader title="Checkout" />

        {/* Stepper */}
        <div className="flex items-center mb-8 max-w-md">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* Step 0 — Address */}
            {step === 0 && (
              <Card className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Delivery Address</h3>
                <div className="flex gap-2">
                  {addressTypes.map(({ value, label, icon: Icon }) => (
                    <Button key={value} variant={address.type === value ? "default" : "outline"} size="sm"
                      onClick={() => setAddress({ ...address, type: value as any })}>
                      <Icon className="h-3 w-3 mr-1" /> {label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Full Name *</Label><Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Phone *</Label><Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
                  <div className="space-y-1 col-span-2"><Label>Address Line 1 *</Label><Input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></div>
                  <div className="space-y-1 col-span-2"><Label>Address Line 2</Label><Input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></div>
                  <div className="space-y-1"><Label>City *</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                  <div className="space-y-1"><Label>State *</Label><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Pincode *</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
                </div>
                <Button onClick={() => setStep(1)} disabled={!addrValid}>Continue to Payment →</Button>
              </Card>
            )}

            {/* Step 1 — Payment */}
            {step === 1 && (
              <Card className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map(({ value, icon: Icon }) => (
                    <label key={value}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                        ${payment === value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <input type="radio" name="payment" checked={payment === value}
                        onChange={() => setPayment(value)} className="sr-only" />
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-sm">{value}</span>
                      <div className={`ml-auto h-4 w-4 rounded-full border-2
                        ${payment === value ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                  <Button onClick={() => setStep(2)}>Review Order →</Button>
                </div>
              </Card>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <Card className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Review Your Order</h3>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <p className="font-medium">{address.name} · {address.phone}</p>
                  <p className="text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}</p>
                  <p className="mt-1 text-xs">Payment: <strong>{payment}</strong></p>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-3">
                      <img src={item.image || `https://picsum.photos/seed/${item.product_id}/48/48`}
                        className="h-12 w-12 rounded object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={handlePlaceOrder} disabled={placing} size="lg">
                    {placing ? "Placing Order…" : `Place Order — ₹${finalTotal.toLocaleString()}`}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Summary sidebar */}
          <Card className="p-6 h-fit sticky top-20">
            <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.title} ×{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>MRP</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="text-green-600">FREE</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
