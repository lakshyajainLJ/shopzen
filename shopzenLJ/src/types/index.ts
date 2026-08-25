export interface Product {
  id: string;
  name: string;
  title?: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
  subtotal?: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  total_price: number;
}

export interface OrderItem {
  product_id: string;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  total_amount?: number;
  total_price?: number;
  shipping_address?: ShippingAddress;
  address?: ShippingAddress;
  payment_method: string;
  payment_status: string;
  order_status: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  order_count?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedProducts {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
