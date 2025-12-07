export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://aaliyaa.crowdemo.com";

export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SocialProvider = "google" | "facebook";

const TOKEN_KEY = "aaliyaa.auth.token";
const USER_KEY = "aaliyaa.auth.user";

const getStorages = () => {
  if (typeof window === "undefined") return [];
  return [localStorage, sessionStorage];
};

const readFromStorages = (key: string) => {
  for (const storage of getStorages()) {
    const value = storage.getItem(key);
    if (value) return value;
  }
  return null;
};

export const getStoredToken = (): string | null => readFromStorages(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = readFromStorages(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const persistAuth = (auth: AuthResponse, remember = true) => {
  if (typeof window === "undefined") return;

  const primary = remember ? localStorage : sessionStorage;
  primary.setItem(TOKEN_KEY, auth.token);
  primary.setItem(USER_KEY, JSON.stringify(auth.user ?? {}));

  const secondary = remember ? sessionStorage : localStorage;
  secondary.removeItem(TOKEN_KEY);
  secondary.removeItem(USER_KEY);
};

export const clearStoredAuth = () => {
  getStorages().forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
};

type ApiRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  auth?: boolean;
};

const extractErrorMessage = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (message) return String(message);

    const error = (payload as { error?: unknown }).error;
    if (error) return String(error);

    const errors = (payload as { errors?: Record<string, unknown> }).errors;
    if (errors && typeof errors === "object") {
      const values = Object.values(errors);
      for (const value of values) {
        if (Array.isArray(value) && value.length > 0) return String(value[0]);
        if (value) return String(value);
      }
    }
  }
  return null;
};

const apiRequest = async <T>({ path, method = "GET", data, auth = false }: ApiRequestOptions): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Sign in to continue.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = extractErrorMessage(payload) ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (payload ?? {}) as T;
};

export const login = (email: string, password: string) =>
  apiRequest<AuthResponse>({
    path: "/api/auth/login",
    method: "POST",
    data: { email, password },
  });

export const register = (name: string, email: string, password: string) =>
  apiRequest<AuthResponse>({
    path: "/api/auth/register",
    method: "POST",
    data: { name, email, password },
  });

export const socialLogin = (provider: SocialProvider, accessToken: string) =>
  apiRequest<AuthResponse>({
    path: `/api/auth/social/${provider}`,
    method: "POST",
    data: { access_token: accessToken },
  });

export const fetchCurrentUser = () =>
  apiRequest<AuthUser>({
    path: "/api/auth/me",
    method: "GET",
    auth: true,
  });

export const logout = () =>
  apiRequest<{ message?: string }>({
    path: "/api/auth/logout",
    method: "POST",
    auth: true,
  });
