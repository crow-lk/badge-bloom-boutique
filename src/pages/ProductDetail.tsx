import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fallbackProducts, useProducts, type Product } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

const displayValue = (value: string | number | null | undefined, fallback = "—") =>
  value === undefined || value === null || value === "" ? fallback : String(value);

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useProducts();

  const products = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackProducts;
    return [] as Product[];
  }, [data, isLoading]);

  const product = useMemo(() => {
    if (!products.length) return undefined;
    if (slug) {
      const match = products.find((item) => item.slug === slug);
      if (match) return match;
    }
    return products[0];
  }, [products, slug]);

  const [activeImage, setActiveImage] = useState(product?.images?.[0] ?? null);

  useEffect(() => {
    if (product?.images?.[0]) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const relatedProducts = useMemo(
    () => (product ? products.filter((item) => item.slug !== product.slug).slice(0, 3) : []),
    [product, products],
  );

  const showLoading = isLoading && !product;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 space-y-12">
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 space-y-6">
            <Alert variant="destructive">
              <AlertTitle>We couldn&apos;t find this product</AlertTitle>
              <AlertDescription>Try returning to the shop to browse all items.</AlertDescription>
            </Alert>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const heroImage = activeImage ?? product.images[0];
  const statusVariant = product.status.toLowerCase() === "active" ? "outline" : "secondary";
  const collectionLabel = product.collection_id ? `Collection ${product.collection_id}` : "New arrival";
  const seasonLabel = displayValue(product.season, "Seasonless");
  const brandLabel = displayValue(product.brand_id, "Aaliyaa Atelier");
  const description = product.description ?? "Description coming soon.";
  const careInstructions = product.care_instructions ?? "Care instructions coming soon.";
  const materialDetails = product.material_composition ?? "Material details coming soon.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6 space-y-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/shop">Shop</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to shop
            </Link>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Using fallback product data</AlertTitle>
              <AlertDescription>We couldn&apos;t reach the live catalog API. Data shown below comes from local fixtures.</AlertDescription>
            </Alert>
          )}

          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <Card className="overflow-hidden border-0 bg-card shadow-sm">
                <div className="relative">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img
                      src={heroImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  </div>

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="backdrop-blur">
                      {collectionLabel}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 backdrop-blur">
                      {seasonLabel}
                    </Badge>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={cn(
                      "group overflow-hidden rounded-md border border-border bg-muted transition hover:shadow-md",
                      activeImage === image && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} alt ${index + 1}`}
                      className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>

            <Card className="space-y-8 border-0 bg-card/90 p-8 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Aaliyaa</p>
                  <h1 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">{product.name}</h1>
                  <p className="mt-3 text-sm text-muted-foreground">{description}</p>
                </div>
                <Badge variant={statusVariant}>
                  {product.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-light">{product.priceLabel}</span>
                <Badge variant="secondary">{brandLabel}</Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground">Highlights</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {product.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-sm font-light text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                  Add to bag
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <Spec label="SKU prefix" value={displayValue(product.sku_prefix)} />
                <Spec label="Category" value={displayValue(product.category_id)} />
                <Spec label="Collection" value={displayValue(product.collection_id)} />
                <Spec label="Season" value={displayValue(product.season, "Seasonless")} />
                <Spec label="HS code" value={displayValue(product.hs_code)} />
                <Spec label="Default tax ID" value={displayValue(product.default_tax_id)} />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium tracking-[0.12em] text-foreground">Quality assurance</p>
                    <p className="text-sm text-muted-foreground">
                      Each piece is inspected for stitch integrity, color-fastness, and finish before it leaves our studio.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/70">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="care">Care</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="border-0 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="grid gap-4 md:grid-cols-3">
                  <Detail title="Material" value={displayValue(materialDetails)} />
                  <Detail title="Brand" value={displayValue(product.brand_id, "Aaliyaa Atelier")} />
                  <Detail title="Category" value={displayValue(product.category_id)} />
                  <Detail title="Season" value={displayValue(product.season, "Seasonless")} />
                  <Detail title="Collection" value={displayValue(product.collection_id)} />
                  <Detail title="Status" value={displayValue(product.status)} />
                </div>
                <Separator className="my-6" />
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </Card>
            </TabsContent>

            <TabsContent value="care">
              <Card className="border-0 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium tracking-wide text-foreground">Care instructions</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{careInstructions}</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logistics">
              <Card className="border-0 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="grid gap-4 md:grid-cols-3">
                  <Detail title="HS code" value={displayValue(product.hs_code)} />
                  <Detail title="Default tax ID" value={displayValue(product.default_tax_id)} />
                  <Detail title="SKU prefix" value={displayValue(product.sku_prefix)} />
                </div>
                <Separator className="my-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  <LogisticsItem
                    title="Fast shipping"
                    description="Tracked delivery in 3-5 business days for domestic orders."
                    icon={<Truck className="h-5 w-5 text-primary" />}
                  />
                  <LogisticsItem
                    title="Protected packaging"
                    description="Pieces arrive in reusable garment pouches to reduce waste."
                    icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Curated for you</p>
                <h3 className="text-2xl font-light tracking-tight">More from Aaliyaa</h3>
              </div>
              <Link
                to="/shop"
                className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.slug}
                  to={`/products/${item.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                        {displayValue(item.collection_id, "Collection")}
                      </p>
                      <Badge variant="outline">{displayValue(item.status)}</Badge>
                    </div>
                    <h4 className="text-lg font-light tracking-wide">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Spec = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3">
    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

const Detail = ({ title, value }: { title: string; value: string | number }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

const LogisticsItem = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium tracking-wide text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ProductDetailSkeleton = () => (
  <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-card shadow-sm">
        <Skeleton className="aspect-[4/5] w-full" />
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`thumb-${index}`} className="h-28 w-full rounded-md" />
        ))}
      </div>
    </div>

    <Card className="space-y-6 border-0 bg-card/90 p-8 shadow-sm backdrop-blur">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-16 w-full" />

      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`spec-${index}`} className="h-12 w-full rounded-md" />
        ))}
      </div>

      <Skeleton className="h-14 w-full rounded-md" />
    </Card>
  </div>
);

export default ProductDetail;
