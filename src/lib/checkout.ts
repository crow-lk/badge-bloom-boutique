import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { ensureCartSessionId, getCartSessionId } from "@/lib/cart";

export type PaymentMethod = {
  id: number | string;
  name: string;
  slug?: string | null;
  provider?: string | null;
  type?: string | null;
  icon_path?: string | null;
  instructions?: string | null;
  description?: string | null;
  logo?: string | null;
  [key: string]: unknown;
};

export type PaymentRecord = {
  id: number | string;
  reference_number?: string;
  amount_paid?: string | number;
  payment_method?: PaymentMethod;
  [key: string]: unknown;
};

export type PaymentCustomerInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export type InitiatePaymentInput = {
  payment_method_id: number | string;
  customer: PaymentCustomerInput;
  items_description?: string;
  session_id?: string | null;
  shipping_total?: number;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
};

export type InitiatePaymentResponse = {
  message?: string;
  payment: PaymentRecord;
  checkout: Record<string, unknown>;
};

export type PaymentStatusResponse = {
  payment_status?: string;
  status?: string;
  payment?: PaymentRecord;
  [key: string]: unknown;
};

export type CheckoutAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
};

export type PlaceOrderInput = {
  payment_id: number | string;
  shipping: CheckoutAddress;
  billing?: CheckoutAddress | null;
  session_id?: string | null;
  currency?: string;
  shipping_total?: number;
  notes?: string;
  payment_method_id?: number | string;
};

export type PlaceOrderResponse = {
  message?: string;
  order: Record<string, unknown>;
};

export type StoredPayHereCheckout = {
  payment_id: number | string;
  payment_method_id: number | string;
  shipping: CheckoutAddress;
  billing?: CheckoutAddress | null;
  shipping_total?: number;
  notes?: string;
  currency?: string;
  session_id?: string | null;
  checkout?: Record<string, unknown>;
  created_at: string;
};

const PAYHERE_STORAGE_KEY = "aaliyaa.payhere.checkout";

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
    // ignore json parse errors
  }
  throw new Error(message);
};

const resolveCheckoutContext = () => {
  const token = getStoredToken();
  const existingSession = getCartSessionId();
  const sessionId = existingSession ?? (token ? null : ensureCartSessionId());
  return { token, sessionId };
};

const authHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    await parseError(response);
  }
  const payload = await response.json();
  if (Array.isArray(payload)) return payload as PaymentMethod[];
  if (Array.isArray(payload?.data)) return payload.data as PaymentMethod[];
  if (payload?.payment_methods && Array.isArray(payload.payment_methods)) {
    return payload.payment_methods as PaymentMethod[];
  }
  return [];
};

export const initiatePayment = async (
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResponse> => {
  const { token, sessionId } = resolveCheckoutContext();
  const response = await fetch(`${API_BASE_URL}/api/checkout/payments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      ...input,
      session_id: input.session_id ?? sessionId ?? undefined,
    }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as InitiatePaymentResponse;
};

export const placeOrder = async (
  input: PlaceOrderInput
): Promise<PlaceOrderResponse> => {
  const { token, sessionId } = resolveCheckoutContext();

  const response = await fetch(`${API_BASE_URL}/api/checkout/orders`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...input,
      session_id: input.session_id ?? sessionId ?? undefined,
    }),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as PlaceOrderResponse;
};

export const fetchPaymentStatus = async (
  paymentId: number | string,
): Promise<PaymentStatusResponse> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as PaymentStatusResponse;
};

export const storePayHereCheckout = (payload: StoredPayHereCheckout) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PAYHERE_STORAGE_KEY, JSON.stringify(payload));
};

export const loadPayHereCheckout = (): StoredPayHereCheckout | null => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PAYHERE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPayHereCheckout;
  } catch {
    return null;
  }
};

export const clearPayHereCheckout = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PAYHERE_STORAGE_KEY);
};
