import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackCollections, useCollection, useCollections, type Collection } from "@/hooks/use-collections";
import { fallbackProducts, useProducts, type Product } from "@/hooks/use-products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type HydratedCollection = {
  collection: Collection;
  hasProducts: boolean;
};

type ResolvedCollection = {
  collection: Collection | null;
  hasProducts: boolean;
};

const Collections = () => {
  const { data, isLoading, isError } = useCollections();
  const {
    data: productData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const collections = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackCollections;
    return [];
  }, [data, isLoading]);

  const products: Product[] = useMemo(() => {
    if (productData?.length) return productData;
    if (!isProductsLoading) return fallbackProducts;
    return [];
  }, [productData, isProductsLoading]);

  const normalizeRawKey = useCallback((value?: string | number | null) => {
    if (value === undefined || value === null) return "";
    return String(value).trim().toLowerCase();
  }, []);

  const normalizeSlugKey = useCallback(
    (value?: string | number | null) => {
      const raw = normalizeRawKey(value);
      if (!raw) return "";
      return raw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    },
    [normalizeRawKey],
  );

  const productCollectionMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    const addToMap = (key: string, product: Product) => {
      if (!key) return;
      const bucket = map.get(key);
      if (bucket) bucket.push(product);
      else map.set(key, [product]);
    };
    products.forEach((product) => {
      addToMap(normalizeRawKey(product.collection_id), product);
      addToMap(normalizeSlugKey(product.collection_id), product);
    });
    return map;
  }, [normalizeRawKey, normalizeSlugKey, products]);

  const resolveCollection = useCallback(
    (collection: Collection | null): ResolvedCollection => {
      if (!collection) return { collection: null, hasProducts: false };

      const candidateValues = [collection.id, collection.slug, collection.name];
      const keys = Array.from(
        new Set(
          candidateValues
            .flatMap((value) => [normalizeRawKey(value), normalizeSlugKey(value)])
            .filter((key) => Boolean(key)),
        ),
      );

      const matches: Product[] = [];
      const seen = new Set<Product["id"]>();
      keys.forEach((key) => {
        if (!key) return;
        const bucket = productCollectionMap.get(key);
        if (!bucket?.length) return;
        bucket.forEach((product) => {
          if (seen.has(product.id)) return;
          seen.add(product.id);
          matches.push(product);
        });
      });

      const gallery = Array.from(
        new Set(
          matches
            .flatMap((product) => {
              if (product.images?.length) return product.images;
              if (product.image) return [product.image];
              return [];
            })
            .filter(Boolean),
        ),
      ) as string[];

      const previewProducts =
        matches.length > 0
          ? matches.slice(0, 4).map((product) => ({
              id: product.id,
              name: product.name,
              image: product.images?.[0] ?? product.image,
              slug: product.slug,
              priceLabel: product.inquiryOnly ? "Enquire for price" : product.priceLabel,
            }))
          : collection.previewProducts;

      const merged: Collection = {
        ...collection,
        coverImage: gallery[0] ?? collection.coverImage,
        heroImage: gallery[0] ?? collection.heroImage,
        lookbook: gallery.length ? gallery.slice(0, 5) : collection.lookbook,
        previewProducts,
        productCount: matches.length || collection.productCount,
      };

      return { collection: merged, hasProducts: matches.length > 0 };
    },
    [normalizeRawKey, normalizeSlugKey, productCollectionMap],
  );

  const hydratedCollections = useMemo(
    () =>
      collections.map((collection) => {
        const resolved = resolveCollection(collection);
        return {
          collection: resolved.collection ?? collection,
          hasProducts: resolved.hasProducts,
        };
      }),
    [collections, resolveCollection],
  );

  const selectedId = detailOpen ? selectedCollectionId ?? undefined : undefined;
  const {
    data: detailData,
    isFetching: isDetailFetching,
    isError: isDetailError,
  } = useCollection(selectedId, {
    initialData: selectedCollection ?? undefined,
    enabled: detailOpen && Boolean(selectedId),
  });

  const detailResolved = useMemo(
    () => resolveCollection(detailData ?? selectedCollection ?? null),
    [detailData, resolveCollection, selectedCollection],
  );

  const displayedCollection = detailResolved.collection ?? null;
  const detailHasProducts = detailResolved.hasProducts;
  const detailLoading = detailOpen && !displayedCollection;

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollectionId(collection.id);
    setSelectedCollection(collection);
    setDetailOpen(true);
  };

  const handleSheetChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setSelectedCollectionId(null);
      setSelectedCollection(null);
    }
  };

  const showLoading = isLoading && !collections.length;

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

          {(isError || isProductsError) && (
            <Alert variant="destructive">
              <AlertTitle>Using fallback collection data</AlertTitle>
              <AlertDescription>
                We couldn&apos;t reach the live catalog. Showing cached collections instead.
              </AlertDescription>
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
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hydratedCollections.map(({ collection }) => (
                <CollectionCard key={collection.slug} collection={collection} onSelect={() => handleSelectCollection(collection)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Sheet open={detailOpen} onOpenChange={handleSheetChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l border-border/70 bg-background/95 px-6 py-8 sm:max-w-lg"
        >
          <CollectionDetailPanel
            collection={displayedCollection}
            hasProducts={detailHasProducts}
            isLoading={detailLoading}
            isError={isDetailError}
            isRefreshing={Boolean(isDetailFetching && displayedCollection)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

const CollectionCard = ({ collection, onSelect }: { collection: Collection; onSelect: () => void }) => {
  const gallery = useMemo(() => {
    const productImages = collection.previewProducts
      .map((product) => product.image)
      .filter((image): image is string => Boolean(image));
    const heroCandidates = [collection.coverImage, collection.heroImage].filter(
      (image): image is string => Boolean(image),
    );
    const combined = [...collection.lookbook, ...productImages, ...heroCandidates].filter((image): image is string =>
      Boolean(image),
    );
    return Array.from(new Set(combined)).slice(0, 6);
  }, [collection]);

  const images = gallery.length ? gallery : [collection.coverImage, collection.heroImage].filter(
    (image): image is string => Boolean(image),
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [collection.slug, images.length]);

  useEffect(() => {
    if (!images.length || images.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const total = images.length;
        if (!total) return 0;
        return (prev + 1) % total;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const hasMultipleImages = images.length > 1;

  const goToSlide = (delta: number) => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => {
      const total = images.length;
      if (!total) return 0;
      return (prev + delta + total) % total;
    });
  };

  const displayedImage = images[currentIndex] ?? images[0];

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-border/80 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={`${collection.name} look ${currentIndex + 1}`}
              className="h-full w-full object-cover transition duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Imagery in progress
            </div>
          )}
        </div>
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={() => goToSlide(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous look"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next look"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, index) => (
                <button
                  type="button"
                  key={`${collection.slug}-dot-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 w-4 rounded-full transition ${
                    index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Show look ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{collection.name}</p>
          <p className="text-xs text-muted-foreground">{collection.productCount || 0} styles</p>
        </div>
        <p className="text-sm font-light text-muted-foreground">{collection.summary ?? collection.description}</p>
        {collection.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collection.highlights.slice(0, 2).map((highlight) => (
              <Badge
                key={`${collection.slug}-${highlight}`}
                variant="outline"
                className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em]"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-[11px] uppercase tracking-[0.3em]">
        <button type="button" onClick={onSelect} className="text-muted-foreground transition hover:text-foreground">
          View details
        </button>
        <Link to="/products/all" className="text-primary transition hover:text-primary/80">
          Shop edit
        </Link>
      </div>
    </Card>
  );
};

const CollectionDetailPanel = ({
  collection,
  hasProducts,
  isLoading,
  isError,
  isRefreshing,
}: {
  collection: Collection | null;
  hasProducts: boolean;
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
}) => {
  if (isLoading || !collection) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-[220px] w-full rounded-2xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Live detail unavailable</AlertTitle>
          <AlertDescription>Showing the cached collection information.</AlertDescription>
        </Alert>
      )}

      <SheetHeader className="space-y-2 text-left">
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Collection detail</p>
        <SheetTitle className="text-3xl font-light">{collection.name}</SheetTitle>
        {collection.summary && (
          <SheetDescription className="text-base text-foreground">{collection.summary}</SheetDescription>
        )}
        {isRefreshing && <p className="text-xs text-muted-foreground">Refreshing details…</p>}
      </SheetHeader>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <img src={collection.heroImage} alt={`${collection.name} hero`} className="h-full w-full object-cover" />
      </div>

      {collection.highlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collection.highlights.map((highlight) => (
            <Badge key={`${collection.slug}-highlight-${highlight}`} variant="secondary" className="rounded-full px-3 py-1">
              {highlight}
            </Badge>
          ))}
        </div>
      )}

      {collection.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {collection.tags.map((tag) => (
            <span key={`${collection.slug}-tag-${tag}`}>{tag}</span>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed text-muted-foreground">{collection.description}</p>

      {collection.meta.length > 0 && (
        <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
          {collection.meta.map((meta) => (
            <div
              key={`${collection.slug}-${meta.label}`}
              className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground"
            >
              <span>{meta.label}</span>
              <span className="text-foreground">{meta.value}</span>
            </div>
          ))}
        </div>
      )}

      {collection.previewProducts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Featured looks</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {collection.previewProducts.map((product) => (
              <div key={product.id} className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-3">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Image coming soon
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                {product.priceLabel && <p className="text-xs text-muted-foreground">{product.priceLabel}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {collection.lookbook.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lookbook</p>
          <div className="grid grid-cols-2 gap-3">
            {collection.lookbook.map((image, index) => (
              <div
                key={`${collection.slug}-look-${index}`}
                className="overflow-hidden rounded-xl border border-border/60 bg-muted"
              >
                <img src={image} alt={`${collection.name} look ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasProducts && (
        <Card className="border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary">
          <p className="font-medium uppercase tracking-[0.25em]">New drop in progress</p>
          <p className="mt-2 text-primary">
            Our atelier is putting the finishing touches on this collection. Check back soon or explore the rest of the shop
            in the meantime.
          </p>
        </Card>
      )}

      <Button asChild className="w-full">
        <Link to="/products/all">Browse collection</Link>
      </Button>
    </div>
  );
};

export default Collections;
