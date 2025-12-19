import coatImage from "@/assets/product-coat.jpg";
import pantsImage from "@/assets/product-pants.jpg";
import sweaterImage from "@/assets/product-sweater.jpg";
import tshirtImage from "@/assets/product-tshirt.jpg";
import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export type CollectionMetaField = {
  label: string;
  value: string;
};

export type CollectionPreviewProduct = {
  id: string | number;
  name: string;
  image?: string;
  slug?: string;
  priceLabel?: string;
};

export type Collection = {
  id: string | number;
  name: string;
  slug: string;
  summary?: string;
  description: string;
  heroImage: string;
  coverImage: string;
  lookbook: string[];
  productCount: number;
  status?: string;
  season?: string;
  tags: string[];
  highlights: string[];
  meta: CollectionMetaField[];
  previewProducts: CollectionPreviewProduct[];
};

const fallbackImages = [coatImage, sweaterImage, pantsImage, tshirtImage];

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
    return asString(record.url ?? record.src ?? record.href ?? record.value ?? record.label ?? record.title);
  }
  return undefined;
};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const parsed = asString(value);
    if (parsed) return parsed;
  }
  return undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
};

const pickNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = asNumber(value);
    if (parsed != null) return parsed;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean) as string[];
  }
  if (typeof value === "string") {
    return value
      .split(/[,|]/)
      .map((entry) => asString(entry))
      .filter(Boolean) as string[];
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return toStringArray(record.data);
    }
  }
  return [];
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || value;

const normalizeCollection = (raw: unknown, index = 0): Collection => {
  const record = asRecord(raw);
  const fallbackName = pickString(record.name, record.title, `Collection ${index + 1}`) ?? `Collection ${index + 1}`;
  const slug = slugify(pickString(record.slug, record.handle, record.code, fallbackName) ?? fallbackName);
  const numericId = pickNumber(record.id, record.collection_id, record.uuid);
  const season = pickString(record.season, record.season_name, record.collection_season);
  const status = pickString(record.status, record.state, record.visibility);
  const summary = pickString(record.summary, record.tagline, record.subtitle, record.short_description);
  const description =
    pickString(record.description, record.long_description, record.body, summary, "Details coming soon.") ??
    "Details coming soon.";

  const gallerySources = [
    record.lookbook,
    record.lookbook_images,
    record.gallery,
    record.images,
    record.media,
    record.photos,
    record["images.data"],
  ];
  const gallery = unique(
    [
      pickString(record.hero_image),
      pickString(record.banner_image),
      pickString(record.featured_image),
      pickString(record.cover_image),
      pickString(record.image),
      pickString(record.thumbnail),
      ...gallerySources.flatMap((entry) => toStringArray(entry)),
    ].filter(Boolean) as string[],
  );
  const fallbackImage = fallbackImages[index % fallbackImages.length];
  const heroImage = gallery[0] ?? fallbackImage;
  const coverImage = pickString(record.cover_image, record.featured_image) ?? gallery[1] ?? heroImage ?? fallbackImage;
  const lookbook = (gallery.length ? gallery : [heroImage, coverImage]).slice(0, 5);

  const rawTags = [
    ...toStringArray(record.tags),
    ...toStringArray(record.labels),
    ...toStringArray(record.meta_tags),
    ...toStringArray(record.keywords),
  ];
  const tags = unique(rawTags).slice(0, 4);

  const rawHighlights = toStringArray(record.highlights ?? record.badges ?? record.pillars ?? record.focus_points);
  const highlights = rawHighlights.length
    ? rawHighlights.slice(0, 3)
    : unique([season ? `${season} drop` : undefined, status, "Limited release craftsmanship"].filter(Boolean) as string[]);

  const rawProducts = Array.isArray(record.products) ? record.products : [];
  const productCount =
    pickNumber(
      record.products_count,
      record.product_count,
      record.items_count,
      record.count,
      record.total_products,
      record.total_items,
    ) ?? rawProducts.length;

  const previewProducts: CollectionPreviewProduct[] = rawProducts.slice(0, 4).map((product, productIndex) => {
    const entry = asRecord(product);
    const productName =
      pickString(entry.name, entry.title, entry.product_name, `Look ${productIndex + 1}`) ?? `Look ${productIndex + 1}`;
    const productSlug = pickString(entry.slug, entry.handle);
    const productImage =
      pickString(
        entry.cover_image,
        entry.hero_image,
        entry.featured_image,
        entry.image,
        entry.thumbnail,
        ...(Array.isArray(entry.images) ? entry.images : []),
      ) ?? undefined;
    const priceLabel = pickString(entry.price_label, entry.priceLabel, entry.price, entry.selling_price);
    const productId = entry.id ?? entry.product_id ?? productSlug ?? `${slug}-${productIndex}`;
    return {
      id: productId,
      name: productName,
      image: productImage,
      slug: productSlug,
      priceLabel,
    };
  });

  const meta: CollectionMetaField[] = [];
  const pushMeta = (label: string, value?: string) => {
    if (value) meta.push({ label, value });
  };
  pushMeta("Season", season);
  pushMeta("Status", status);
  pushMeta("Release", pickString(record.release_date, record.launch_date, record.published_at));
  pushMeta("Color story", pickString(record.color_story, record.palette, record.tones));
  pushMeta("Location", pickString(record.location, record.origin, record.city));

  return {
    id: numericId ?? slug,
    name: fallbackName,
    slug,
    summary,
    description,
    heroImage,
    coverImage,
    lookbook: lookbook.filter(Boolean),
    productCount,
    status,
    season,
    tags,
    highlights,
    meta,
    previewProducts,
  };
};

const extractCollectionList = (payload: unknown) => {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.collections)) return record.collections;
  if (Array.isArray(record.items)) return record.items;
  if (record.data && typeof record.data === "object") return [record.data];
  if (record.collection && typeof record.collection === "object") return [record.collection];
  return [];
};

const extractCollectionObject = (payload: unknown) => {
  if (Array.isArray(payload)) return asRecord(payload[0]);
  const record = asRecord(payload);
  if (record.data && typeof record.data === "object") return asRecord(record.data);
  if (record.collection && typeof record.collection === "object") return asRecord(record.collection);
  return record;
};

const fetchCollections = async (): Promise<Collection[]> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/api/collections`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }
  const payload = await response.json();
  const list = extractCollectionList(payload);
  return list.map((entry, index) => normalizeCollection(entry, index));
};

const fetchCollectionById = async (collectionId: string | number): Promise<Collection> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/api/collections/${collectionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch collection");
  }
  const payload = await response.json();
  return normalizeCollection(extractCollectionObject(payload));
};

export const useCollections = () =>
  useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

export const useCollection = (
  collectionId?: string | number,
  options?: { initialData?: Collection; enabled?: boolean },
) =>
  useQuery<Collection>({
    queryKey: ["collections", collectionId],
    queryFn: () => {
      if (collectionId == null) {
        throw new Error("Collection id is required");
      }
      return fetchCollectionById(collectionId);
    },
    enabled: Boolean(collectionId) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    initialData: options?.initialData,
  });
