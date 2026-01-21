import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fallbackProducts, getProductDisplayPrice, useProducts, type Product } from "@/hooks/use-products";
import { Link } from "react-router-dom";

const Index = () => {
  const { data } = useProducts();
  const products: Product[] = data?.length ? data : fallbackProducts;
  const spotlight = products[0] ?? fallbackProducts[0];
  const secondaryLook = products[1] ?? fallbackProducts[1];
  const tertiaryLook = products[2] ?? fallbackProducts[2];
  const spotlightHighlights = spotlight.highlights?.length
    ? spotlight.highlights
    : ["Limited availability", "Crafted with care"];
  const displayPrice = (item: Product) => getProductDisplayPrice(item);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <ProductGrid />

      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Lookbook</p>
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">Wear it your way</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Textures and layers styled for sunrise errands to late dinners.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[spotlight, secondaryLook, tertiaryLook].map((item) => (
              <Card
                key={`look-${item.id}`}
                className="overflow-hidden border-border/70 bg-card/80 shadow-sm"
              >
                <div className="relative">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={item.images?.[1] ?? item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 space-y-1.5">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/80 text-center sm:text-left">
                      {item.collection_id}
                    </p>
                    <p className="text-lg font-medium text-white text-center sm:text-left">{item.name}</p>
                    <p className="text-sm text-white/80 text-center sm:text-left">{displayPrice(item)}</p>
                  </div>
                </div>
                <div className="p-4 text-center sm:text-left">
                  <Button asChild variant="ghost" className="w-full sm:w-auto">
                    <Link to={`/products/${item.slug}`}>View {item.name}</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 grid gap-10 items-stretch lg:grid-cols-[1.05fr_0.95fr]">
          <div className="w-full flex flex-col gap-8 lg:order-2">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Spotlight piece</p>
              <h2 className="text-3xl font-light tracking-tight md:text-4xl">{spotlight.name}</h2>
              <p className="text-muted-foreground">{spotlight.description}</p>
              <div className="flex flex-wrap gap-2">
                {spotlightHighlights.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-border/70 bg-card/70 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fabric & composition</p>
                  <p className="mt-1 text-sm text-foreground">
                    {spotlight.material_composition ?? "Natural fiber blend chosen for drape and breathability."}
                  </p>
                </Card>
                <Card className="border-border/70 bg-card/70 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Care</p>
                  <p className="mt-1 text-sm text-foreground">
                    {spotlight.care_instructions ?? "Gentle cycle or hand wash. Lay flat to dry to preserve shape."}
                  </p>
                </Card>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link to={`/products/${spotlight.slug}`}>View product</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Sizes: {spotlight.sizes?.join(", ") || "XS to XL"} · {displayPrice(spotlight)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6 lg:mt-auto">
              {[spotlight.images?.[1] ?? secondaryLook.image, spotlight.images?.[2] ?? tertiaryLook.image].map(
                (image, index) => (
                  <div
                    key={`spotlight-detail-${index}`}
                    className="overflow-hidden rounded-2xl border border-border/70 bg-muted"
                  >
                    <img
                      src={image}
                      alt={`${spotlight.name} detail ${index + 1}`}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="w-full sm:w-4/5 max-w-[720px] lg:max-w-none lg:order-1">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted h-full">
              <img
                src={spotlight.images?.[0] ?? spotlight.image}
                alt={spotlight.name}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card/80 p-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Insider list</p>
              <h3 className="text-2xl font-light tracking-tight md:text-3xl">
                Get early access to limited runs and studio events.
              </h3>
              <p className="text-sm text-muted-foreground">
                We only email when a new capsule drops or when we host something special in-store.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                type="email"
                placeholder="you@example.com"
                className="w-full md:w-72"
                aria-label="Email for early access"
              />
              <Button className="w-full md:w-auto">Notify me</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
