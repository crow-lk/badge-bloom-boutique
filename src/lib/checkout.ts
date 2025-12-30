import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { ensureCartSessionId, getCartSessionId } from "@/lib/cart";

export type PaymentMethod = {
  id: number | string;
  name: string;
  slug?: string | null;
  provider?: string | null;
  type?: string | null;
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
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
};

export type InitiatePaymentResponse = {
  message?: string;
  payment: PaymentRecord;
  checkout: Record<string, unknown>;
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
  const sessionId = existingSession ?? ensureCartSessionId();
  if (token) {
    return { token, sessionId };
  }
  return { token: null, sessionId };
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

export const placeOrder = async (input: PlaceOrderInput): Promise<PlaceOrderResponse> => {
  const { token, sessionId } = resolveCheckoutContext();
  const response = await fetch(`${API_BASE_URL}/api/checkout/orders`, {
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
  return (await response.json()) as PlaceOrderResponse;
};
