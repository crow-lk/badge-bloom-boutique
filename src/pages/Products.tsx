import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/hooks/use-collections";
import { fallbackCategories, useCategories } from "@/hooks/use-categories";
import { filterActiveProducts } from "@/lib/product-status";
import { fallbackProducts, getProductDisplayPrice, useProducts, type Product } from "@/hooks/use-products";
import { useMemo, useState } from "react";

const displayValue = (value: string | number | null | undefined, fallback = "—") =>
  value === undefined || value === null || value === "" ? fallback : String(value);

const normalizeRawKey = (value?: string | number | null) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().toLowerCase();
};

const normalizeSlugKey = (value?: string | number | null) => {
  const raw = normalizeRawKey(value);
  if (!raw) return "";
  return raw
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const buildMatchKeys = (...values: (string | number | null | undefined)[]) => {
  const keys = values
    .flatMap((value) => [normalizeRawKey(value), normalizeSlugKey(value)])
    .filter((key): key is string => Boolean(key));
  return Array.from(new Set(keys));
};

const matchValueAgainstKeys = (value: string | number | null | undefined, keys: string[]) => {
  if (!keys.length) return false;
  const valueKeys = buildMatchKeys(value);
  if (!valueKeys.length) return false;
  return keys.some((key) => valueKeys.includes(key));
};

type FilterState = {
  collection: string;
  category: string;
  size: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type FilterOption = SelectOption & {
  matchKeys: string[];
};

const Products = () => {
  const { data, isLoading, isError } = useProducts();
  const { data: collectionsData } = useCollections();
  const { data: categoriesData } = useCategories();

  const products: Product[] = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackProducts;
    return [];
  }, [data, isLoading]);
  const activeProducts = useMemo(() => filterActiveProducts(products), [products]);

  const [filters, setFilters] = useState<FilterState>({
    collection: "",
    category: "",
    size: "",
  });

  const collectionOptions = useMemo<FilterOption[]>(() => {
    const source = collectionsData ?? [];
    const map = new Map<string, FilterOption>();
    source.forEach((collection, index) => {
      const label = collection.name ?? `Collection ${index + 1}`;
      const fallbackValue = collection.id ?? collection.slug ?? `${label}-${index}`;
      const value = String(fallbackValue);
      if (!map.has(value)) {
        map.set(value, {
          label,
          value,
          matchKeys: buildMatchKeys(collection.id, collection.slug, collection.name, label),
        });
      }
    });
    return Array.from(map.values());
  }, [collectionsData]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const source = categoriesData?.length ? categoriesData : fallbackCategories;
    const map = new Map<string, FilterOption>();
    source.forEach((category, index) => {
      const label = category.name ?? `Category ${index + 1}`;
      const fallbackValue = category.id ?? category.slug ?? `${label}-${index}`;
      const value = String(fallbackValue);
      if (!map.has(value)) {
        map.set(value, {
          label,
          value,
          matchKeys: buildMatchKeys(category.id, category.slug, category.name, label),
        });
      }
    });
    return Array.from(map.values());
  }, [categoriesData]);

  const sizeOptions = useMemo<SelectOption[]>(() => {
    const uniqueSizes = Array.from(new Set(activeProducts.flatMap((p) => p.sizes ?? []).filter(Boolean)));
    return uniqueSizes.map((size) => ({ label: size, value: size }));
  }, [activeProducts]);

  const selectedCollectionOption = collectionOptions.find((option) => option.value === filters.collection);
  const selectedCategoryOption = categoryOptions.find((option) => option.value === filters.category);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      const matchesCollection =
        !selectedCollectionOption ||
        matchValueAgainstKeys(product.collection_id, selectedCollectionOption.matchKeys);
      const matchesCategory =
        !selectedCategoryOption || matchValueAgainstKeys(product.category_id, selectedCategoryOption.matchKeys);
      const matchesSize = !filters.size || (product.sizes ?? []).includes(filters.size);
      return matchesCollection && matchesCategory && matchesSize;
    });
  }, [activeProducts, filters.size, selectedCategoryOption, selectedCollectionOption]);

  const resetFilters = () =>
    setFilters({
      collection: "",
      category: "",
      size: "",
    });

  const showLoading = isLoading && !products.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Browse</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">All Products</h1>
            <p className="text-sm text-muted-foreground md:text-base">Filter by collection, category, or size.</p>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Using fallback catalog data</AlertTitle>
              <AlertDescription>We couldn&apos;t reach the live API. Showing locally cached products instead.</AlertDescription>
            </Alert>
          )}

          <Card className="border border-border bg-card/80 p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <Select
                label="Collection"
                value={filters.collection}
                onChange={(value) => setFilters((prev) => ({ ...prev, collection: value }))}
                options={collectionOptions}
              />
              <Select
                label="Category"
                value={filters.category}
                onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                options={categoryOptions}
              />
              <Select
                label="Size"
                value={filters.size}
                onChange={(value) => setFilters((prev) => ({ ...prev, size: value }))}
                options={sizeOptions}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filteredProducts.length} of {activeProducts.length || 0} items
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters} disabled={!products.length}>
                Clear filters
              </Button>
            </div>
          </Card>

          {showLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={`product-skeleton-${index}`} className="overflow-hidden border-0 bg-card/80 shadow-sm">
                  <Skeleton className="aspect-square w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  image={product.image}
                  name={product.name}
                  price={getProductDisplayPrice(product)}
                  priceValue={product.inquiryOnly ? null : product.price}
                  sizes={product.sizes}
                  slug={product.slug}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-border bg-card/80 p-6 text-center text-sm text-muted-foreground">
              No products match the selected filters.
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) => (
  <label className="flex flex-col gap-1 text-sm text-foreground">
    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={`${label}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default Products;
