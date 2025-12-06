import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackProducts, useProducts, type Product } from "@/hooks/use-products";
import { useMemo, useState } from "react";

const displayValue = (value: string | number | null | undefined, fallback = "—") =>
  value === undefined || value === null || value === "" ? fallback : String(value);

type FilterState = {
  collection: string;
  category: string;
  size: string;
  status: string;
};

const Products = () => {
  const { data, isLoading, isError } = useProducts();

  const products: Product[] = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackProducts;
    return [];
  }, [data, isLoading]);

  const [filters, setFilters] = useState<FilterState>({
    collection: "",
    category: "",
    size: "",
    status: "",
  });

  const collections = useMemo(
    () => Array.from(new Set(products.map((p) => displayValue(p.collection_id, "Collection")))),
    [products],
  );
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => displayValue(p.category_id, "Category")))),
    [products],
  );
  const sizes = useMemo(() => Array.from(new Set(products.flatMap((p) => p.sizes ?? []))), [products]);
  const statuses = useMemo(
    () => Array.from(new Set(products.map((p) => displayValue(p.status, "active")).map((s) => s.toString()))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCollection = !filters.collection || displayValue(product.collection_id, "Collection") === filters.collection;
      const matchesCategory = !filters.category || displayValue(product.category_id, "Category") === filters.category;
      const matchesStatus = !filters.status || displayValue(product.status, "active") === filters.status;
      const matchesSize = !filters.size || (product.sizes ?? []).includes(filters.size);
      return matchesCollection && matchesCategory && matchesStatus && matchesSize;
    });
  }, [filters, products]);

  const resetFilters = () =>
    setFilters({
      collection: "",
      category: "",
      size: "",
      status: "",
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
            <p className="text-sm text-muted-foreground md:text-base">Filter by collection, category, status, or size.</p>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Using fallback catalog data</AlertTitle>
              <AlertDescription>We couldn&apos;t reach the live API. Showing locally cached products instead.</AlertDescription>
            </Alert>
          )}

          <Card className="border border-border bg-card/80 p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-4">
              <Select
                label="Collection"
                value={filters.collection}
                onChange={(value) => setFilters((prev) => ({ ...prev, collection: value }))}
                options={collections}
              />
              <Select
                label="Category"
                value={filters.category}
                onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                options={categories}
              />
              <Select
                label="Size"
                value={filters.size}
                onChange={(value) => setFilters((prev) => ({ ...prev, size: value }))}
                options={sizes}
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                options={statuses}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filteredProducts.length} of {products.length || 0} items
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
                  price={product.priceLabel}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <label className="flex flex-col gap-1 text-sm text-foreground">
    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={`${label}-${option}`} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default Products;
