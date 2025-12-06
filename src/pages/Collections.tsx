import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackProducts, useProducts, type Product } from "@/hooks/use-products";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const displayValue = (value: string | number | null | undefined, fallback = "—") =>
  value === undefined || value === null || value === "" ? fallback : String(value);

type CollectionItem = {
  name: string;
  slug: string;
  count: number;
  cover: string;
};

const Collections = () => {
  const { data, isLoading, isError } = useProducts();

  const products: Product[] = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackProducts;
    return [];
  }, [data, isLoading]);

  const collections: CollectionItem[] = useMemo(() => {
    const map = new Map<string, CollectionItem>();
    products.forEach((product) => {
      const name = displayValue(product.collection_id, "Collection");
      const key = String(product.collection_id ?? name).toLowerCase().replace(/\s+/g, "-");
      if (!map.has(key)) {
        map.set(key, { name, slug: key, count: 0, cover: product.images?.[0] ?? product.image });
      }
      const item = map.get(key);
      if (item) {
        item.count += 1;
        if (!item.cover && product.images?.[0]) {
          item.cover = product.images[0];
        }
      }
    });
    return Array.from(map.values());
  }, [products]);

  const showLoading = isLoading && !products.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Discover</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Collections</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Browse every Aaliyaa collection and jump into the pieces that match your mood.
            </p>
            <div className="mt-3 flex justify-center">
              <Link
                to="/products/all"
                className="text-sm font-light text-primary underline-offset-4 transition hover:underline"
              >
                View all products
              </Link>
            </div>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Using fallback catalog data</AlertTitle>
              <AlertDescription>We couldn&apos;t reach the live API. Showing locally cached collections instead.</AlertDescription>
            </Alert>
          )}

          {showLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={`collection-skeleton-${index}`} className="overflow-hidden border-0 bg-card/80 shadow-sm">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  to="/shop"
                  className="group overflow-hidden rounded-md border border-border bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={collection.cover}
                      alt={collection.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">{collection.count} styles</p>
                    </div>
                    <Badge variant="secondary">View</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
