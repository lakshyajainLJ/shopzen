import { Product, CartData, Order, User, ApiResponse, PaginatedProducts } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  
  const json: ApiResponse<T> | any = await res.json().catch(() => ({}));
  
  if (!res.ok || json.success === false) {
    const errorMsg = json?.error?.message || json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

// ── Auth ──────────────────────────────────────────────────
export const apiLogin = (email: string, password: string) =>
  request<{ token: string; user: User }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name: string, email: string, password: string) =>
  request<{ token?: string; user?: User; message: string }>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const apiGetProfile = () => request<User>("/profile");

// ── Products ──────────────────────────────────────────────
export const apiGetProducts = (page = 1, limit = 50, category?: string, search?: string) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(category ? { category } : {}),
    ...(search ? { search } : {})
  }).toString();
  return request<PaginatedProducts | Product[]>(`/products?${query}`);
};

export const apiGetProduct = (id: string) => request<Product>(`/products/${id}`);

export const apiCreateProduct = (data: Partial<Product>) =>
  request<Product>("/products", { method: "POST", body: JSON.stringify(data) });

export const apiUpdateProduct = (id: string, data: Partial<Product>) =>
  request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const apiDeleteProduct = (id: string) =>
  request<{ message: string }>(`/products/${id}`, { method: "DELETE" });

// ── Cart ──────────────────────────────────────────────────
export const apiGetCart = () => request<CartData>("/cart");

export const apiAddToCart = (product_id: string, quantity = 1) =>
  request<CartData>("/cart/add", { method: "POST", body: JSON.stringify({ product_id, quantity }) });

export const apiUpdateCart = (product_id: string, quantity: number) =>
  request<CartData>("/cart/update", { method: "PUT", body: JSON.stringify({ product_id, quantity }) });

export const apiRemoveCart = (product_id: string) =>
  request<CartData>("/cart/remove", { method: "DELETE", body: JSON.stringify({ product_id }) });

export const apiClearCart = () =>
  request<CartData>("/cart/clear", { method: "DELETE" });

// ── Orders ────────────────────────────────────────────────
export const apiPlaceOrder = (data: { address: any; payment_method: string }) =>
  request<Order>("/orders/place", { method: "POST", body: JSON.stringify(data) });

export const apiGetOrders = () => request<Order[]>("/orders");

// ── Admin ─────────────────────────────────────────────────
export const apiAdminOrders = () => request<Order[]>("/admin/orders");
export const apiAdminUsers = () => request<User[]>("/admin/users");
export const apiAdminUpdateOrderStatus = (id: string, status: string) =>
  request<{ message: string; status: string }>(`/admin/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

export const apiAdminGenerateDescription = (data: { name: string; category?: string; key_features?: string }) =>
  request<{ description: string; status: string }>("/admin/ai/generate-description", {
    method: "POST",
    body: JSON.stringify(data)
  });

// ── AI ────────────────────────────────────────────────────
export const apiAIChat = (messages: Array<{ role: string; content: string }>) =>
  request<{ reply: string; recommended_products: Product[] }>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages })
  });

export const apiAISemanticSearch = (query: string, category?: string, max_price?: number) =>
  request<Product[]>("/ai/semantic-search", {
    method: "POST",
    body: JSON.stringify({ query, category, max_price })
  });

export const apiGetRecommendations = (limit = 6) =>
  request<Product[]>(`/recommendations?limit=${limit}`);

export const apiAISummarizeReviews = (product_id: string) =>
  request<{ summary: string; likes: string[]; dislikes: string[]; overall: string }>("/ai/summarize-reviews", {
    method: "POST",
    body: JSON.stringify({ product_id })
  });

// ── Token Management ──────────────────────────────────────
export function getStoredToken() { return localStorage.getItem("token"); }
export function getStoredUser(): User | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      name: payload.name || "User",
      email: payload.email || "",
      role: payload.role || "user"
    };
  } catch { return null; }
}
export function saveToken(token: string) { localStorage.setItem("token", token); }
export function clearToken() { localStorage.removeItem("token"); }
