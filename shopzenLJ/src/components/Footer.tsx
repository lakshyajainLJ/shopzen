import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">ShopZen</h3>
            <p className="text-sm opacity-80">Your premium shopping destination. Quality products, great prices, exceptional service.</p>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/products" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">All Products</Link>
              <Link to="/cart" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">Shopping Cart</Link>
              <Link to="/wishlist" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">Wishlist</Link>
              <Link to="/orders" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">Track Orders</Link>
            </div>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
            <div className="space-y-2">
              <span className="block text-sm opacity-80">help@shopzen.com</span>
              <span className="block text-sm opacity-80">+91 1800-123-4567</span>
              <span className="block text-sm opacity-80">Mon-Sat, 9am-6pm</span>
            </div>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-3 text-sm uppercase tracking-wider">Follow Us</h4>
            <div className="space-y-2">
              <span className="block text-sm opacity-80">Instagram</span>
              <span className="block text-sm opacity-80">Twitter</span>
              <span className="block text-sm opacity-80">Facebook</span>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
          © 2024 ShopZen. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
