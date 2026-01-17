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
import { fallbackProducts, getProductDisplayPrice, useProducts, type Product } from "@/hooks/use-products";
import { getStoredToken } from "@/lib/auth";
import { addCartItem } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const displayValue = (value: string | number | null | undefined, fallback = "—") =>
  value === undefined || value === null || value === "" ? fallback : String(value);

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SWIPE_THRESHOLD = 50;

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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");

  useEffect(() => {
    if (product?.images?.length) {
      setCurrentImageIndex(0);
      setFlipDirection("forward");
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const relatedProducts = useMemo(
    () => (product ? products.filter((item) => item.slug !== product.slug).slice(0, 3) : []),
    [product, products],
  );

  const showLoading = isLoading && !product;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
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
        <main className="pt-24 pb-12">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
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

  const heroImage = product.images[currentImageIndex] ?? product.images[0];
  const canGoPrev = currentImageIndex > 0;
  const canGoNext = currentImageIndex < product.images.length - 1;

  const goToIndex = (index: number) => {
    if (index === currentImageIndex) return;
    setFlipDirection(index > currentImageIndex ? "forward" : "backward");
    setCurrentImageIndex(Math.max(0, Math.min(product.images.length - 1, index)));
  };
  const statusVariant = product.status.toLowerCase() === "active" ? "outline" : "secondary";
  const collectionLabel = product.collection_id ? `Collection ${product.collection_id}` : "New arrival";
  const seasonLabel = displayValue(product.season, "Seasonless");
  const brandLabel = displayValue(product.brand_id, "Aaliyaa Atelier");
  const description = product.description ?? "Description coming soon.";
  const careInstructions = product.care_instructions ?? "Care instructions coming soon.";
  const materialDetails = product.material_composition ?? "Material details coming soon.";
  const inquiryOnly = product.inquiryOnly;
  const priceDisplay = getProductDisplayPrice(product);
  const mailtoLink = `mailto:info@aaliyaa.com?subject=Inquiry%20about%20${encodeURIComponent(product.name)}`;
  const whatsappLink = `https://wa.me/94703363363?text=${encodeURIComponent(
    `Hi Aaliyaa team, I'm interested in ${product.name}.`,
  )}`;

  const requireAuth = () => {
    const token = getStoredToken();
    if (token) return true;
    const redirect = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    navigate(redirect);
    toast.message("Please sign in to continue", { description: "We’ll bring you back to this page after login." });
    return false;
  };

  const handleAddToBag = async () => {
    if (inquiryOnly) return;
    setAdding(true);
    try {
      await addCartItem(product.id, 1);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to bag");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add to bag.";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleEnquire = () => {
    if (!requireAuth()) return;
    window.location.href = mailtoLink;
  };

  const handleWhatsApp = () => {
    if (!requireAuth()) return;
    window.open(whatsappLink, "_blank", "noopener");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < SWIPE_THRESHOLD) return;

    if (distance > 0 && canGoNext) {
      // swipe left → next
      setFlipDirection("forward");
      setCurrentImageIndex((i) => Math.min(i + 1, product.images.length - 1));
    } else if (distance < 0 && canGoPrev) {
      // swipe right → prev
      setFlipDirection("backward");
      setCurrentImageIndex((i) => Math.max(i - 1, 0));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <Card className="mx-auto w-full max-w-[480px] overflow-hidden border-0 bg-card shadow-sm md:max-w-[520px]">
                <div className="relative">
                  <div
                    className="aspect-[4/5] w-full max-h-[520px] overflow-hidden bg-muted relative [perspective:1400px] touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      key={heroImage}
                      src={heroImage}
                      alt={product.name}
                      className={cn(
                        "h-full w-full object-cover transition duration-500",
                        flipDirection === "forward" ? "animate-flip-forward" : "animate-flip-backward",
                      )}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-3">
                      {canGoPrev ? (
                        <button
                          type="button"
                          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          onClick={() => goToIndex(currentImageIndex - 1)}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="h-10 w-10" aria-hidden />
                      )}
                      {canGoNext ? (
                        <button
                          type="button"
                          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          onClick={() => goToIndex(currentImageIndex + 1)}
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="h-10 w-10" aria-hidden />
                      )}
                    </div>
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

              <div className="mx-auto w-full max-w-[480px] md:max-w-[520px]">
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => goToIndex(index)}
                      aria-pressed={currentImageIndex === index}
                      className={cn(
                        "group flex-shrink-0 snap-start overflow-hidden rounded-md border border-border bg-muted transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        currentImageIndex === index && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} alt ${index + 1}`}
                        className="h-14 w-14 object-cover transition duration-300 group-hover:scale-105 sm:h-16 sm:w-16 md:h-20 md:w-20"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Card className="space-y-5 border-0 bg-card/90 p-5 shadow-sm backdrop-blur md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Aaliyaa</p>
                  <h1 className="mt-2 text-2xl font-light tracking-tight md:text-3xl">{product.name}</h1>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base text-justify">{description}</p>
                </div>
                <Badge variant={statusVariant}>
                  {product.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-2xl font-light md:text-3xl">{priceDisplay}</span>
                <Badge variant="secondary">{brandLabel}</Badge>
                {inquiryOnly && <Badge variant="outline">Inquiry only</Badge>}
              </div>

              {inquiryOnly ? (
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    className="flex-1 h-11 bg-primary text-primary-foreground text-sm shadow-md hover:bg-primary/90 md:h-12"
                    onClick={handleEnquire}
                  >
                    Enquire
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-11 text-sm md:h-12"
                    onClick={handleWhatsApp}
                  >
                    Enquire on WhatsApp
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 md:h-12 md:w-12">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    className="flex-1 h-11 bg-primary text-primary-foreground text-sm shadow-md hover:bg-primary/90 md:h-12 disabled:opacity-60"
                    onClick={handleAddToBag}
                    disabled={adding}
                  >
                    {adding ? "Adding..." : "Add to bag"}
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 md:h-12 md:w-12">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                {/* <Spec label="SKU prefix" value={displayValue(product.sku_prefix)} />
                <Spec label="Category" value={displayValue(product.category_id)} /> */}
                <Spec label="Collection" value={displayValue(product.collection_name)} />
                <Spec label="Season" value={displayValue(product.season, "Seasonless")} />
                {/* <Spec label="HS code" value={displayValue(product.hs_code)} />
                <Spec label="Default tax ID" value={displayValue(product.default_tax_id)} /> */}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium tracking-[0.12em] text-foreground">Quality assurance</p>
                    <p className="text-sm text-muted-foreground text-justify">
                      Each piece is inspected for stitch integrity, color-fastness, and finish before it leaves our studio.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="details" className="space-y-5">
            <TabsList className="grid w-full grid-cols-3 bg-muted/70">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="care">Care</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="border-0 bg-card/80 p-5 shadow-sm backdrop-blur md:p-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <Detail title="Material" value={displayValue(materialDetails)} />
                  <Detail title="Brand" value={displayValue(product.brand_id, "Aaliyaa Atelier")} />
                  <Detail title="Category" value={displayValue(product.category_id)} />
                  <Detail title="Season" value={displayValue(product.season, "Seasonless")} />
                  <Detail title="Collection" value={displayValue(product.collection_id)} />
                  <Detail title="Status" value={displayValue(product.status)} />
                </div>
                <Separator className="my-4" />
                <p className="text-sm leading-relaxed text-muted-foreground text-justify">{description}</p>
              </Card>
            </TabsContent>

            <TabsContent value="care">
              <Card className="border-0 bg-card/80 p-5 shadow-sm backdrop-blur md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium tracking-wide text-foreground">Care instructions</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify">{careInstructions}</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logistics">
              <Card className="border-0 bg-card/80 p-5 shadow-sm backdrop-blur md:p-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <Detail title="HS code" value={displayValue(product.hs_code)} />
                  <Detail title="Default tax ID" value={displayValue(product.default_tax_id)} />
                  <Detail title="SKU prefix" value={displayValue(product.sku_prefix)} />
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 md:grid-cols-2">
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

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Curated for you</p>
                <h3 className="text-xl font-light tracking-tight md:text-2xl">More from Aaliyaa</h3>
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
                  <div className="space-y-2 p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                        {displayValue(item.collection_id, "Collection")}
                      </p>
                      <Badge variant="outline">{displayValue(item.status)}</Badge>
                    </div>
                    <h4 className="text-base font-light tracking-wide md:text-lg">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{getProductDisplayPrice(item)}</p>
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
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium tracking-wide text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground text-justify">{description}</p>
    </div>
  </div>
);

const ProductDetailSkeleton = () => (
  <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div className="space-y-3">
      <Card className="mx-auto w-full max-w-[480px] overflow-hidden border-0 bg-card shadow-sm md:max-w-[520px]">
        <Skeleton className="aspect-[4/5] w-full max-h-[520px]" />
      </Card>
      <div className="mx-auto w-full max-w-[480px] md:max-w-[520px]">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`thumb-${index}`} className="h-14 w-14 flex-shrink-0 snap-start rounded-md sm:h-16 sm:w-16 md:h-20 md:w-20" />
          ))}
        </div>
      </div>
    </div>

    <Card className="space-y-5 border-0 bg-card/90 p-5 shadow-sm backdrop-blur md:p-6">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-16 w-full" />

      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`spec-${index}`} className="h-12 w-full rounded-md" />
        ))}
      </div>

      <Skeleton className="h-14 w-full rounded-md" />
    </Card>
  </div>
);

export default ProductDetail;
