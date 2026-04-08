// ─────────────────────────────────────────────────────────
//  ShopZen API — connects to Flask backend at :5000
// ─────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "https://shopzen-uov2.onrender.com";

// Attach JWT token from localStorage to every request
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────
export const apiLogin    = (email: string, password: string) =>
  request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
    "/login", { method: "POST", body: JSON.stringify({ email, password }) }
  );

export const apiRegister = (name: string, email: string, password: string) =>
  request<{ message: string }>("/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

// ── Products ──────────────────────────────────────────────
export const apiGetProducts  = () => request<any[]>("/products");
export const apiGetProduct   = (id: string) => request<any>(`/products/${id}`);
export const apiCreateProduct = (data: any) =>
  request<any>("/products", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateProduct = (id: string, data: any) =>
  request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteProduct = (id: string) =>
  request<any>(`/products/${id}`, { method: "DELETE" });

// ── Cart ──────────────────────────────────────────────────
export const apiGetCart     = () => request<any>("/cart");
export const apiAddToCart   = (product_id: string, quantity: number) =>
  request<any>("/cart/add", { method: "POST", body: JSON.stringify({ product_id, quantity }) });
export const apiUpdateCart  = (product_id: string, quantity: number) =>
  request<any>("/cart/update", { method: "PUT", body: JSON.stringify({ product_id, quantity }) });
export const apiRemoveCart  = (product_id: string) =>
  request<any>("/cart/remove", { method: "DELETE", body: JSON.stringify({ product_id }) });

// ── Orders ────────────────────────────────────────────────
export const apiPlaceOrder  = (data: any) =>
  request<any>("/orders/place", { method: "POST", body: JSON.stringify(data) });
export const apiGetOrders   = () => request<any[]>("/orders");

// ── Admin ─────────────────────────────────────────────────
export const apiAdminOrders = () => request<any[]>("/admin/orders");
export const apiAdminUsers  = () => request<any[]>("/admin/users");

// ── Helpers ───────────────────────────────────────────────
export function getStoredToken() { return localStorage.getItem("token"); }
export function getStoredUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub, name: payload.name || "", email: payload.email || "", role: payload.role || "user" };
  } catch { return null; }
}
export function saveToken(token: string) { localStorage.setItem("token", token); }
export function clearToken() { localStorage.removeItem("token"); }
