export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: { product: Product; quantity: number; subtotal: number }[];
  totalPrice: number;
  status: "pending" | "processing" | "packed" | "shipped" | "out" | "delivered";
  address: Address;
  paymentMethod: string;
  createdAt: string;
}

export interface Address {
  type: "home" | "work" | "other";
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
  orderCount: number;
}

export const products: Product[] = [
  { id: "1", name: "Classic White T-Shirt", price: 799, originalPrice: 1299, description: "Premium cotton crew neck t-shirt. Soft, breathable fabric perfect for everyday wear.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "Fashion", rating: 4.5, reviews: 128, inStock: true },
  { id: "2", name: "Running Sneakers Pro", price: 3499, originalPrice: 5999, description: "Lightweight running shoes with cushioned sole and breathable mesh upper.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "Fashion", rating: 4.7, reviews: 256, inStock: true },
  { id: "3", name: "Luxury Chronograph Watch", price: 8999, originalPrice: 14999, description: "Stainless steel chronograph watch with sapphire crystal and leather strap.", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", category: "Watches", rating: 4.8, reviews: 89, inStock: true },
  { id: "4", name: "Wireless Noise-Cancelling Headphones", price: 4999, originalPrice: 7999, description: "Over-ear headphones with active noise cancellation and 30-hour battery life.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", category: "Electronics", rating: 4.6, reviews: 342, inStock: true },
  { id: "5", name: "Leather Crossbody Bag", price: 2499, originalPrice: 3999, description: "Genuine leather crossbody bag with adjustable strap and multiple compartments.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", category: "Bags", rating: 4.4, reviews: 67, inStock: true },
  { id: "6", name: "Smartphone Pro Max", price: 69999, originalPrice: 89999, description: "Latest flagship smartphone with 108MP camera, 5G connectivity, and AMOLED display.", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", category: "Electronics", rating: 4.9, reviews: 512, inStock: true },
  { id: "7", name: "Aviator Sunglasses", price: 1999, originalPrice: 3499, description: "Classic aviator sunglasses with UV400 protection and polarized lenses.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", category: "Accessories", rating: 4.3, reviews: 198, inStock: true },
  { id: "8", name: "Slim Fit Denim Jeans", price: 1899, originalPrice: 2999, description: "Stretch denim slim fit jeans with classic 5-pocket design.", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", category: "Fashion", rating: 4.2, reviews: 156, inStock: true },
  { id: "9", name: "Bluetooth Speaker Portable", price: 2999, originalPrice: 4999, description: "Waterproof portable Bluetooth speaker with 360° sound and 12-hour battery.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", category: "Electronics", rating: 4.5, reviews: 278, inStock: true },
  { id: "10", name: "Canvas Backpack", price: 1599, originalPrice: 2499, description: "Durable canvas backpack with laptop compartment and water-resistant coating.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", category: "Bags", rating: 4.6, reviews: 134, inStock: true },
  { id: "11", name: "Mechanical Keyboard RGB", price: 5499, originalPrice: 7999, description: "Cherry MX mechanical keyboard with per-key RGB lighting and aluminum frame.", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", category: "Electronics", rating: 4.7, reviews: 445, inStock: true },
  { id: "12", name: "Sports Digital Watch", price: 2999, originalPrice: 4999, description: "Multi-sport GPS watch with heart rate monitor and 7-day battery life.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", category: "Watches", rating: 4.4, reviews: 201, inStock: true },
  { id: "13", name: "Wireless Earbuds Pro", price: 3999, originalPrice: 5999, description: "True wireless earbuds with ANC, transparency mode, and wireless charging case.", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400", category: "Electronics", rating: 4.6, reviews: 367, inStock: true },
  { id: "14", name: "Cotton Polo Shirt", price: 1299, originalPrice: 1999, description: "Classic fit polo shirt in premium piqué cotton with embroidered logo.", image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400", category: "Fashion", rating: 4.3, reviews: 89, inStock: true },
  { id: "15", name: "Laptop Stand Adjustable", price: 1999, originalPrice: 2999, description: "Ergonomic aluminum laptop stand with adjustable height and angle.", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", category: "Accessories", rating: 4.5, reviews: 167, inStock: true },
  { id: "16", name: "Leather Wallet Bifold", price: 999, originalPrice: 1799, description: "Genuine leather bifold wallet with RFID blocking and multiple card slots.", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400", category: "Accessories", rating: 4.4, reviews: 234, inStock: true },
  { id: "17", name: "Fitness Tracker Band", price: 2499, originalPrice: 3999, description: "Slim fitness tracker with SpO2, sleep tracking, and 14-day battery.", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400", category: "Electronics", rating: 4.2, reviews: 312, inStock: true },
  { id: "18", name: "Casual Sneakers White", price: 2799, originalPrice: 4499, description: "Minimalist white leather sneakers with cushioned insole and rubber outsole.", image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400", category: "Fashion", rating: 4.6, reviews: 178, inStock: true },
  { id: "19", name: "Travel Duffle Bag", price: 3499, originalPrice: 5499, description: "Spacious duffle bag with shoe compartment, water-resistant fabric.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", category: "Bags", rating: 4.5, reviews: 92, inStock: true },
  { id: "20", name: "Smart Watch Ultra", price: 12999, originalPrice: 19999, description: "Premium smartwatch with titanium case, always-on display, and cellular connectivity.", image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400", category: "Watches", rating: 4.8, reviews: 423, inStock: true },
];

export const categories = [
  { name: "All", icon: "grid" },
  { name: "Electronics", icon: "smartphone" },
  { name: "Fashion", icon: "shirt" },
  { name: "Watches", icon: "watch" },
  { name: "Bags", icon: "shopping-bag" },
  { name: "Accessories", icon: "glasses" },
];

export const sampleUsers: User[] = [
  { id: "u1", name: "John Doe", email: "john@example.com", password: "password123", phone: "9876543210", role: "user", createdAt: "2024-01-15", orderCount: 5 },
  { id: "u2", name: "Jane Smith", email: "jane@example.com", password: "password123", phone: "9876543211", role: "user", createdAt: "2024-02-20", orderCount: 3 },
  { id: "u3", name: "Admin User", email: "admin@shopzen.com", password: "admin123", phone: "9876543212", role: "admin", createdAt: "2024-01-01", orderCount: 0 },
  { id: "u4", name: "Rahul Kumar", email: "rahul@example.com", password: "password123", phone: "9876543213", role: "user", createdAt: "2024-03-10", orderCount: 8 },
  { id: "u5", name: "Priya Sharma", email: "priya@example.com", password: "password123", phone: "9876543214", role: "user", createdAt: "2024-04-05", orderCount: 2 },
];

export const sampleOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "u1",
    items: [
      { product: products[0], quantity: 2, subtotal: 1598 },
      { product: products[3], quantity: 1, subtotal: 4999 },
    ],
    totalPrice: 6597,
    status: "delivered",
    address: { type: "home", name: "John Doe", phone: "9876543210", line1: "123 Main Street", line2: "Apt 4B", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    paymentMethod: "UPI",
    createdAt: "2024-12-01",
  },
  {
    id: "ORD-002",
    userId: "u1",
    items: [
      { product: products[5], quantity: 1, subtotal: 69999 },
    ],
    totalPrice: 69999,
    status: "shipped",
    address: { type: "home", name: "John Doe", phone: "9876543210", line1: "123 Main Street", line2: "Apt 4B", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    paymentMethod: "Credit/Debit Card",
    createdAt: "2024-12-15",
  },
  {
    id: "ORD-003",
    userId: "u2",
    items: [
      { product: products[2], quantity: 1, subtotal: 8999 },
      { product: products[6], quantity: 2, subtotal: 3998 },
    ],
    totalPrice: 12997,
    status: "pending",
    address: { type: "work", name: "Jane Smith", phone: "9876543211", line1: "456 Business Park", line2: "Floor 5", city: "Delhi", state: "Delhi", pincode: "110001" },
    paymentMethod: "Cash on Delivery",
    createdAt: "2024-12-20",
  },
  {
    id: "ORD-004",
    userId: "u4",
    items: [
      { product: products[10], quantity: 1, subtotal: 5499 },
      { product: products[12], quantity: 1, subtotal: 3999 },
      { product: products[14], quantity: 1, subtotal: 1999 },
    ],
    totalPrice: 11497,
    status: "processing",
    address: { type: "home", name: "Rahul Kumar", phone: "9876543213", line1: "789 Tech Lane", line2: "", city: "Bangalore", state: "Karnataka", pincode: "560001" },
    paymentMethod: "Net Banking",
    createdAt: "2024-12-22",
  },
];

export const ORDER_STATUSES = ["pending", "processing", "packed", "shipped", "out", "delivered"] as const;
export const STATUS_LABELS: Record<string, string> = {
  pending: "Ordered",
  processing: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out: "Out for Delivery",
  delivered: "Delivered",
};
