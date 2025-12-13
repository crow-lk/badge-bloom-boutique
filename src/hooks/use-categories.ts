import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export type Category = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  status?: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return asString(record.value ?? record.label ?? record.title ?? record.name);
  }
  return undefined;
};

const slugify = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : undefined;

const normalizeCategory = (raw: unknown, index: number): Category => {
  const record = asRecord(raw);
  const fallbackName = asString(record.name ?? record.title ?? `Category ${index + 1}`) ?? `Category ${index + 1}`;
  const slug = slugify(asString(record.slug ?? record.handle ?? fallbackName)) ?? `category-${index + 1}`;
  const identifier = record.id ?? record.category_id ?? slug ?? fallbackName;
  const description =
    asString(record.description ?? record.summary ?? record.short_description ?? record.subtitle) ?? undefined;
  const status = asString(record.status ?? record.state);

  return {
    id: identifier ?? slug ?? index + 1,
    name: fallbackName,
    slug,
    description,
    status,
  };
};

const extractCategoryList = (payload: unknown) => {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.categories)) return record.categories;
  if (Array.isArray(record.items)) return record.items;
  if (record.data && typeof record.data === "object") return [record.data];
  if (record.category && typeof record.category === "object") return [record.category];
  return [];
};

const fetchCategories = async (): Promise<Category[]> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const payload = await response.json();
  const list = extractCategoryList(payload);
  return list.map((entry, index) => normalizeCategory(entry, index));
};

export const fallbackCategories: Category[] = [
  {
    id: "capsules",
    name: "Capsules",
    slug: "capsules",
    description: "Limited seasonal drops designed in micro runs.",
  },
  {
    id: "lounge",
    name: "Lounge",
    slug: "lounge",
    description: "Soft silhouettes for inside days and travel.",
  },
  {
    id: "signature",
    name: "Signature",
    slug: "signature",
    description: "Everyday icons from the studio archives.",
  },
];

export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
