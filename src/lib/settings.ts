import { API_BASE_URL } from "@/lib/auth";

const HERO_IMAGE_PATH = "/api/settings/hero-image";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const stringValue = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const fetchHeroImageUrl = async (signal?: AbortSignal): Promise<string | null> => {
  const response = await fetch(`${API_BASE_URL}${HERO_IMAGE_PATH}`, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch hero image settings");
  }

  const payload = await response.json().catch(() => null);
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root.settings ?? root);

  return stringValue(data.image_url ?? data.imageUrl);
};
