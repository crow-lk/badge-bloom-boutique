import type { Color, Product } from "@/hooks/use-products";

export type ProductCardVariant = {
  key: string;
  image: string;
  color?: Color;
};

export const getProductCardVariants = (product: Product): ProductCardVariant[] => {
  const variants = new Map<string, ProductCardVariant>();

  product.imageMeta?.forEach((image) => {
    if (!image.color) return;

    const colorKey = String(image.color.id || image.color.name).trim();
    if (!colorKey || variants.has(colorKey)) return;

    variants.set(colorKey, {
      key: `${product.slug}-${colorKey}`,
      image: image.url,
      color: image.color,
    });
  });

  if (variants.size) return Array.from(variants.values());

  return [{ key: product.slug, image: product.image }];
};
