import { API_BASE_URL, getStoredToken } from "@/lib/auth";

const CART_SESSION_KEY = "aaliyaa.cart.session_id";

const extractCartErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    if (payload?.message) return String(payload.message);
    if (payload?.error) return String(payload.error);
    if (payload?.errors) {
      const errors = payload.errors as Record<string, unknown>;
      const first = Object.values(errors).flat().find(Boolean);
      if (first) return String(first);
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

const parseError = async (response: Response) => {
  const message = (await extractCartErrorMessage(response)) ?? `Request failed with status ${response.status}`;
  throw new Error(message);
};

const shouldRetryWithSession = (message: string | null) =>
  typeof message === "string" && message.toLowerCase().includes("session_id");

type CartRequestContext = { token: string | null; sessionId: string | null };
type CartRequestFactory = (context: CartRequestContext) => Promise<Response>;

const buildCartContext = (): CartRequestContext => {
  const token = getStoredToken();
  const existingSession = getCartSessionId();
  const sessionId = existingSession ?? (token ? null : ensureCartSessionId());
  return { token, sessionId };
};

const requestWithSession = async <T>(makeRequest: CartRequestFactory): Promise<T> => {
  const performRequest = async (context: CartRequestContext, allowRetry: boolean): Promise<T> => {
    const response = await makeRequest(context);
    if (response.ok) {
      try {
        return (await response.json()) as T;
      } catch {
        return {} as T;
      }
    }
    const message = await extractCartErrorMessage(response);
    if (allowRetry && shouldRetryWithSession(message)) {
      clearCartSessionId();
      return performRequest(buildCartContext(), false);
    }
    throw new Error(message ?? `Request failed with status ${response.status}`);
  };

  return performRequest(buildCartContext(), true);
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

export const addCartItem = async (productVariantId: number | string, quantity: number) =>
  requestWithSession(({ token, sessionId }) =>
    fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/items`, sessionId), {
      method: "POST",
      headers: cartHeaders(token ?? undefined),
      body: JSON.stringify({ product_variant_id: productVariantId, quantity, session_id: sessionId ?? undefined }),
    }),
  );

export const mergeGuestCart = async () => {
  const sessionId = getCartSessionId();
  const token = getStoredToken();
  if (!sessionId || !token) return;
  const response = await fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/merge`, sessionId), {
    method: "POST",
    headers: cartHeaders(token),
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  const payload = await response.json().catch(() => ({}));
  clearCartSessionId();
  return payload;
};

const attachSessionQuery = (url: string, sessionId: string | null) => {
  if (!sessionId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}session_id=${encodeURIComponent(sessionId)}`;
};

export const fetchCart = async () =>
  requestWithSession(({ token, sessionId }) =>
    fetch(attachSessionQuery(`${API_BASE_URL}/api/cart`, sessionId), {
      method: "GET",
      headers: cartHeaders(token ?? undefined),
    }),
  );

export const updateCartItem = async (
  cartItemId: number | string,
  quantity?: number,
  productVariantId?: number | string
) =>
  requestWithSession(({ token, sessionId }) => {
    const body: Record<string, unknown> = { session_id: sessionId ?? undefined };
    if (quantity !== undefined) body.quantity = quantity;
    if (productVariantId !== undefined) body.product_variant_id = productVariantId;
    
    return fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/items/${cartItemId}`, sessionId), {
      method: "PUT",
      headers: cartHeaders(token ?? undefined),
      body: JSON.stringify(body),
    });
  });

export const removeCartItem = async (cartItemId: number | string) =>
  requestWithSession(({ token, sessionId }) =>
    fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/items/${cartItemId}`, sessionId), {
      method: "DELETE",
      headers: cartHeaders(token ?? undefined),
    }),
  );

export const clearCart = async () =>
  requestWithSession(({ token, sessionId }) =>
    fetch(attachSessionQuery(`${API_BASE_URL}/api/cart/clear`, sessionId), {
      method: "POST",
      headers: cartHeaders(token ?? undefined),
      body: JSON.stringify({ session_id: sessionId ?? undefined }),
    }),
  );
