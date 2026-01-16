import { useQuery } from "@tanstack/react-query";
import { fetchCart } from "@/lib/cart";

export type CartLine = {
  id: number | string;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
  variant?: string;
  productId?: number | string;
  lineTotal?: number;
  unitPrice?: number;
};

export type CartState = {
  items: CartLine[];
  itemCount: number;
  subtotal?: number;
  total?: number;
  currency?: string;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toStringValue = (value: unknown): string | undefined =>
  value == null ? undefined : String(value);

const normalizeNumberString = (value: string): string => value.replace(/[^\d.-]/g, "");
const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = normalizeNumberString(value);
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
};

const normalizeCartItem = (item: unknown): CartLine => {
  const entry = toRecord(item);
  const product = toRecord(entry.product ?? entry.item ?? entry.product_variant ?? {});
  const variant = toRecord(entry.variant ?? product.variant ?? {});
  const fallbackName =
    entry.name ??
    entry.product_name ??
    entry.title ??
    product.name ??
    product.title ??
    variant.name ??
    variant.title ??
    "Item";
  const quantity =
    parseNumber(entry.quantity ?? entry.qty ?? variant.quantity ?? product.quantity ?? 1) ?? 1;
  const unitPrice =
    parseNumber(
      entry.unit_price ??
        entry.unitPrice ??
        entry.price ??
        entry.line_price ??
        variant.price ??
        product.price ??
        product.selling_price ??
        product.unit_price,
    ) ?? undefined;
  const lineTotal =
    parseNumber(entry.line_total ?? entry.lineTotal ?? entry.total ?? entry.grand_total ?? entry.amount) ??
    (unitPrice != null ? Number((unitPrice * quantity).toFixed(2)) : undefined);

  const candidateImage =
    entry.image ??
    entry.thumbnail ??
    variant.image ??
    variant.thumbnail ??
    product.image ??
    product.thumbnail ??
    entry.product_image ??
    entry.image_url ??
    entry.product_image_url;
  const normalizedImage = (() => {
    if (Array.isArray(candidateImage) && candidateImage.length) return toStringValue(candidateImage[0]);
    if (candidateImage) return toStringValue(candidateImage);
    const productImages = product.images ?? product.gallery ?? product.media ?? product.images_list;
    if (Array.isArray(productImages) && productImages.length) return toStringValue(productImages[0]);
    return undefined;
  })();

  const variantLabel =
    toStringValue(variant.title ?? variant.name ?? variant.sku ?? variant.code ?? variant.value) ??
    toStringValue(entry.variant ?? entry.variant_sku ?? entry.color) ??
    undefined;

  return {
    id:
      entry.id ??
      entry.cart_item_id ??
      entry.item_id ??
      entry.product_variant_id ??
      entry.product_id ??
      product.id ??
      `${fallbackName}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(fallbackName),
    quantity,
    price: unitPrice,
    unitPrice,
    lineTotal,
    productId: entry.product_id ?? product.id,
    image: normalizedImage,
    variant: variantLabel,
  };
};

const buildState = (payload: unknown): CartState => {
  const outer = toRecord(payload);
  const inner = toRecord(outer.data);
  const root = Object.keys(inner).length ? inner : outer;

  const rawItems = root.items ?? root.cart_items ?? [];
  const items =
    Array.isArray(rawItems) && rawItems.length
      ? rawItems.map((item) => normalizeCartItem(item))
      : [];

  const calculatedCount =
    items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const itemCount =
    parseNumber(root.item_count ?? root.total_items ?? root.total_quantity) ??
    parseNumber(outer.item_count ?? outer.total_items ?? outer.total_quantity) ??
    calculatedCount;

  const subtotal =
    parseNumber(root.subtotal ?? root.sub_total ?? root.estimated_subtotal ?? root.estimated_sub_total) ??
    parseNumber(outer.subtotal ?? outer.sub_total ?? outer.estimated_subtotal ?? outer.estimated_sub_total);

  const total =
    parseNumber(root.total ?? root.grand_total ?? root.estimated_total) ??
    parseNumber(outer.total ?? outer.grand_total ?? outer.estimated_total);

  const currency = String(
    root.currency ?? root.currency_code ?? outer.currency ?? outer.currency_code ?? "LKR",
  );

  return {
    items,
    itemCount: Number.isFinite(itemCount) ? itemCount : calculatedCount,
    subtotal: Number.isFinite(subtotal ?? NaN) ? subtotal : undefined,
    total: Number.isFinite(total ?? NaN) ? total : undefined,
    currency,
  };
};

const normalizeCurrencyCode = (currency: string | undefined, fallback: string) => {
  const trimmed = (currency ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(trimmed) ? trimmed : fallback;
};

export const formatCartCurrency = (value?: number, currency = "LKR") => {
  if (value == null || Number.isNaN(value)) return "—";
  const safeCurrency = normalizeCurrencyCode(currency, "LKR");
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-LK", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

export const useCart = () =>
  useQuery<CartState>({
    queryKey: ["cart"],
    queryFn: async () => buildState(await fetchCart()),
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60,
    retry: 1,
  });
