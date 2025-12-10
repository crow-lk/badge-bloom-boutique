import { API_BASE_URL, getStoredToken } from "@/lib/auth";

const CART_SESSION_KEY = "aaliyaa.cart.session_id";

const parseError = async (response: Response) => {
  let message = `Request failed with status ${response.status}`;
  try {
    const payload = await response.json();
    if (payload?.message) message = String(payload.message);
    else if (payload?.error) message = String(payload.error);
    else if (payload?.errors) {
      const errors = payload.errors as Record<string, unknown>;
      const first = Object.values(errors).flat().find(Boolean);
      if (first) message = String(first);
    }
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
};

export const getCartSessionId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_SESSION_KEY);
};

export const ensureCartSessionId = () => {
  if (typeof window === "undefined") return null;
  const existing = localStorage.getItem(CART_SESSION_KEY);
  if (existing) return existing;
  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CART_SESSION_KEY, next);
  return next;
};

export const clearCartSessionId = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_SESSION_KEY);
};

const cartHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const buildCartContext = () => {
  const token = getStoredToken();
  if (token) return { token, sessionId: null as string | null };
  return { token: null, sessionId: ensureCartSessionId() };
};

export const addCartItem = async (productVariantId: number | string, quantity: number) => {
  const { token, sessionId } = buildCartContext();
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    headers: cartHeaders(token ?? undefined),
    body: JSON.stringify({ product_variant_id: productVariantId, quantity, session_id: sessionId ?? undefined }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
};

export const mergeGuestCart = async () => {
  const sessionId = getCartSessionId();
  const token = getStoredToken();
  if (!sessionId || !token) return;
  const response = await fetch(`${API_BASE_URL}/api/cart/merge`, {
    method: "POST",
    headers: cartHeaders(token),
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  clearCartSessionId();
  return response.json();
};

const attachSessionQuery = (url: string, sessionId: string | null) => {
  if (!sessionId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}session_id=${encodeURIComponent(sessionId)}`;
};

export const fetchCart = async () => {
  const { token, sessionId } = buildCartContext();
  const response = await fetch(attachSessionQuery(`${API_BASE_URL}/api/cart`, sessionId), {
    method: "GET",
    headers: cartHeaders(token ?? undefined),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
};

export const updateCartItem = async (cartItemId: number | string, quantity: number) => {
  const { token, sessionId } = buildCartContext();
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
    method: "PUT",
    headers: cartHeaders(token ?? undefined),
    body: JSON.stringify({ quantity, session_id: sessionId ?? undefined }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
};

export const removeCartItem = async (cartItemId: number | string) => {
  const { token, sessionId } = buildCartContext();
  const response = await fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/items/${cartItemId}`, sessionId), {
    method: "DELETE",
    headers: cartHeaders(token ?? undefined),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
};

export const clearCart = async () => {
  const { token, sessionId } = buildCartContext();
  const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
    method: "POST",
    headers: cartHeaders(token ?? undefined),
    body: JSON.stringify({ session_id: sessionId ?? undefined }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
};
