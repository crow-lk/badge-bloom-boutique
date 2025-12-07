import { API_BASE_URL, getStoredToken } from "@/lib/auth";

export type ShippingAddress = {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type ShippingPayload = Omit<ShippingAddress, "id" | "is_default"> & { is_default?: boolean };

const buildHeaders = () => {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in to manage shipping addresses.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  } satisfies HeadersInit;
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
    // ignore parse errors
  }
  throw new Error(message);
};

export const fetchShippingAddresses = async (): Promise<ShippingAddress[]> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-addresses`, {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as ShippingAddress[];
};

export const createShippingAddress = async (payload: ShippingPayload): Promise<ShippingAddress> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-addresses`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as ShippingAddress;
};

export const updateShippingAddress = async (id: number, payload: ShippingPayload): Promise<ShippingAddress> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-addresses/${id}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as ShippingAddress;
};

export const deleteShippingAddress = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-addresses/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return true;
};

export const makeDefaultShippingAddress = async (id: number): Promise<ShippingAddress> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-addresses/${id}/make-default`, {
    method: "POST",
    headers: buildHeaders(),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as ShippingAddress;
};
