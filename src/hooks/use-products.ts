import coatImage from "@/assets/product-coat.jpg";
import pantsImage from "@/assets/product-pants.jpg";
import sweaterImage from "@/assets/product-sweater.jpg";
import tshirtImage from "@/assets/product-tshirt.jpg";
import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

const fallbackImages = [tshirtImage, pantsImage, coatImage, sweaterImage];

export type Color = {
  id: number | string;
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: number | string;
  sku?: string;
  size_id?: number | string;
  size_name?: string;
  selling_price?: number | null;
  quantity: number;
  status?: string;
  color?: Color | null;
};

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  sku_prefix?: string | null;
  sizes?: string[] | null;
  brand_id?: string | number | null;
  category_id?: string | number | null;
  collection_id?: string | number | null;
  collection_name?: string | null;
  season?: string | null;
  description?: string | null;
  care_instructions?: string | null;
  material_composition?: string | null;
  hs_code?: string | null;
  default_tax_id?: string | number | null;
  status?: string | null;
  selling_price?: number | null;
  highlights?: string[] | null;
  images?: string[] | null;
  inquiry_only?: boolean;
  show_price_inquiry_mode?: boolean;
  variants?: ProductVariant[];
  colors?: Color[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  priceLabel: string;
  image: string;
  images: string[];
  sizes: string[];
  variants?: ProductVariant[];
  colors: Color[];
  status: string;
  inquiryOnly: boolean;
  showPriceInquiryMode: boolean;
  sku_prefix?: string | null;
  brand_id?: string | number | null;
  category_id?: string | number | null;
  collection_id?: string | number | null;
  collection_name?: string | null;
  season?: string | null;
  description?: string | null;
  care_instructions?: string | null;
  material_composition?: string | number | null;
  hs_code?: string | null;
  default_tax_id?: string | number | null;
  highlights: string[];
};

export const PRICE_HIDDEN_LABEL = "Enquire for price";

export const getProductDisplayPrice = (
  product: Pick<Product, "priceLabel" | "inquiryOnly" | "showPriceInquiryMode">,
) => {
  if (!product.inquiryOnly) return product.priceLabel;
  return product.showPriceInquiryMode ? product.priceLabel : PRICE_HIDDEN_LABEL;
};

const formatPrice = (value?: number | null) =>
  value == null
    ? "Price on request"
    : new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

const getFirstVariantPrice = (variants?: ProductVariant[]) => {
  if (!variants?.length) return null;
  const candidate = variants.find((variant) => variant.selling_price != null);
  return candidate?.selling_price ?? null;
};

const buildGallery = (index: number) =>
  Array.from({ length: 4 }, (_, offset) => fallbackImages[(index + offset) % fallbackImages.length]);

const buildHighlights = (product: ApiProduct) => {
  const items: string[] = [];
  if (product.season) {
    items.push(`${product.season} ready`);
  }
  if (product.collection_id) {
    items.push(`Collection ${product.collection_id}`);
  }
  if (items.length < 2) {
    items.push("Crafted with care");
  }
  if (items.length < 2) {
    items.push("Limited availability");
  }
  return items.slice(0, 2);
};

const normalizeProduct = (product: ApiProduct, index: number): Product => {
  const gallery = product.images?.length ? product.images : buildGallery(index);
  const sizes = product.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL"];
  const inquiryOnly = Boolean(product.inquiry_only);
  const showPriceInquiryMode =
    product.show_price_inquiry_mode == null ? !inquiryOnly : Boolean(product.show_price_inquiry_mode);
  const variantPrice = getFirstVariantPrice(product.variants);
  const resolvedPrice = product.selling_price ?? variantPrice ?? null;
  const colors =
    product.colors?.length
      ? product.colors
      : Array.from(
          new Map(
            product.variants
              ?.map((v) => v.color)
              .filter(Boolean)
              .map((c) => [c!.id, c!])
          ).values()
        );

  return {
    id: product.id,
    name: product.name ?? `Product ${product.id}`,
    slug: product.slug ?? `product-${product.id}`,
    price: resolvedPrice,
    priceLabel: formatPrice(resolvedPrice),
    image: gallery[0],
    images: gallery,
    sizes,
    variants: product.variants,
    colors: colors ?? [],
    status: product.status ?? "active",
    inquiryOnly,
    showPriceInquiryMode,
    sku_prefix: product.sku_prefix,
    brand_id: product.brand_id,
    category_id: product.category_id,
    collection_id: product.collection_id,
    collection_name: product.collection_name,
    season: product.season,
    description: product.description ?? "Description coming soon.",
    care_instructions: product.care_instructions ?? "Care instructions coming soon.",
    material_composition: product.material_composition ?? "Material details coming soon.",
    hs_code: product.hs_code ?? "—",
    default_tax_id: product.default_tax_id ?? "—",
    highlights: product.highlights?.length ? product.highlights : buildHighlights(product),
  };
};

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Essential T-Shirt",
    slug: "essential-t-shirt",
    price: 45,
    priceLabel: formatPrice(45),
    image: tshirtImage,
    images: [tshirtImage, sweaterImage, pantsImage, coatImage],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { id: 1, name: "White", hex: "#FFFFFF" },
      { id: 2, name: "Black", hex: "#000000" },
      { id: 3, name: "Navy", hex: "#000080" },
    ],
    status: "active",
    inquiryOnly: false,
    showPriceInquiryMode: true,
    sku_prefix: "AL-TSH",
    brand_id: "Aaliyaa Atelier",
    category_id: "Tops",
    collection_id: "Foundations",
    season: "All-season",
    description:
      "A featherlight organic cotton tee cut with a clean crew neckline for effortless layering. Moves with you and holds its shape all day.",
    care_instructions: "Machine wash cold inside out. Lay flat to dry. Cool iron if needed. Avoid bleach to preserve color.",
    material_composition: "95% Organic Cotton, 5% Elastane",
    hs_code: "6109.10.00",
    default_tax_id: "TAX-AL-01",
    highlights: ["Breathable jersey knit", "Designed for layering"],
  },
  {
    id: 2,
    name: "Linen Trousers",
    slug: "linen-trousers",
    price: 89,
    priceLabel: formatPrice(89),
    image: pantsImage,
    images: [pantsImage, coatImage, tshirtImage, sweaterImage],
    sizes: ["2", "4", "6", "8", "10"],
    colors: [
      { id: 1, name: "White", hex: "#FFFFFF" },
      { id: 2, name: "Black", hex: "#000000" },
      { id: 3, name: "Navy", hex: "#000080" },
    ],
    status: "active",
    inquiryOnly: false,
    showPriceInquiryMode: true,
    sku_prefix: "AL-LIN",
    brand_id: "Aaliyaa Atelier",
    category_id: "Bottoms",
    collection_id: "Resort",
    season: "Spring/Summer",
    description:
      "Relaxed straight-leg linen trousers with a clean waistband, hidden side zip, and airy drape. Tailored to sit just right on the hip.",
    care_instructions: "Hand wash cold or gentle cycle. Hang to dry and steam to release creases. Do not tumble dry.",
    material_composition: "70% Linen, 30% Organic Cotton",
    hs_code: "6204.69.00",
    default_tax_id: "TAX-AL-02",
    highlights: ["Cooling linen blend", "Travel-ready crease release"],
  },
  {
    id: 3,
    name: "Wool Coat",
    slug: "wool-coat",
    price: 198,
    priceLabel: formatPrice(198),
    image: coatImage,
    images: [coatImage, pantsImage, sweaterImage, tshirtImage],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { id: 1, name: "White", hex: "#FFFFFF" },
      { id: 2, name: "Black", hex: "#000000" },
      { id: 3, name: "Navy", hex: "#000080" },
    ],
    status: "active",
    inquiryOnly: true,
    showPriceInquiryMode: false,
    sku_prefix: "AL-WLC",
    brand_id: "Aaliyaa Atelier",
    category_id: "Outerwear",
    collection_id: "Heritage",
    season: "Fall/Winter",
    description:
      "Double-faced wool coat with minimalist lapels and a belt that shapes the waist without bulk. Fully lined for warmth without weight.",
    care_instructions: "Dry clean only. Store on a wide hanger. Use a fabric brush to keep the wool fresh between wears.",
    material_composition: "80% Responsible Wool, 20% Recycled Polyester",
    hs_code: "6202.91.00",
    default_tax_id: "TAX-AL-03",
    highlights: ["Warmth without weight", "Lined for smooth layering"],
  },
  {
    id: 4,
    name: "Knit Sweater",
    slug: "knit-sweater",
    price: 75,
    priceLabel: formatPrice(75),
    image: sweaterImage,
    images: [sweaterImage, tshirtImage, pantsImage, coatImage],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { id: 1, name: "White", hex: "#FFFFFF" },
      { id: 2, name: "Black", hex: "#000000" },
      { id: 3, name: "Navy", hex: "#000080" },
    ],
    status: "preorder",
    inquiryOnly: false,
    showPriceInquiryMode: true,
    sku_prefix: "AL-KNT",
    brand_id: "Aaliyaa Atelier",
    category_id: "Knitwear",
    collection_id: "Lounge",
    season: "All-season",
    description:
      "Soft ribbed knit with a subtle mock neck and draped sleeves. Finished with clean cuffs that stay in place as you move.",
    care_instructions: "Hand wash cold, reshape, and dry flat. Store folded to maintain the rib structure.",
    material_composition: "60% Cotton, 30% Viscose, 10% Recycled Nylon",
    hs_code: "6110.30.00",
    default_tax_id: "TAX-AL-04",
    highlights: ["Pill-resistant yarn", "Draped sleeves, clean cuffs"],
  },
];

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = (await response.json()) as ApiProduct[];
      return data.map(normalizeProduct);
    },
  });
