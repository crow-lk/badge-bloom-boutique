import { API_BASE_URL } from "@/lib/auth";

const HERO_IMAGE_PATH = "/api/settings/hero-image";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const stringValue = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};


export interface HeroImageSettings {
  image_urls: string[];
  mobile_image_urls: string[];
}

export const fetchHeroImageUrls = async (signal?: AbortSignal): Promise<HeroImageSettings> => {
  const response = await fetch(`${API_BASE_URL}${HERO_IMAGE_PATH}`, { signal });
  if (!response.ok) {
    throw new Error("Failed to fetch hero image settings");
  }
  const payload = await response.json().catch(() => null);
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root.settings ?? root);
  return {
    image_urls: Array.isArray(data.image_urls) ? data.image_urls.filter(Boolean) : [],
    mobile_image_urls: Array.isArray(data.mobile_image_urls) ? data.mobile_image_urls.filter(Boolean) : [],
  };
};

// Legacy single image fetcher (optional, can be removed if not needed)
export const fetchHeroImageUrl = async (signal?: AbortSignal): Promise<string | null> => {
  const { image_urls } = await fetchHeroImageUrls(signal);
  return image_urls[0] ?? null;
};
