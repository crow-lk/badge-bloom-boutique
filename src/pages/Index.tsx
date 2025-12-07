import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fallbackProducts, useProducts, type Product } from "@/hooks/use-products";
import { ArrowRight, Leaf, Package, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data } = useProducts();
  const products: Product[] = data?.length ? data : fallbackProducts;
  const featurePieces = products.slice(0, 3);
  const spotlight = products[0] ?? fallbackProducts[0];
  const secondaryLook = products[1] ?? fallbackProducts[1];
  const tertiaryLook = products[2] ?? fallbackProducts[2];
  const spotlightHighlights = spotlight.highlights?.length
    ? spotlight.highlights
    : ["Limited availability", "Crafted with care"];
  const displayPrice = (item: Product) => (item.inquiryOnly ? "Enquire for price" : item.priceLabel);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section className="py-20 bg-card/40">
        <div className="container mx-auto px-6 space-y-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Editorial</p>
              <h2 className="text-3xl font-light tracking-tight md:text-4xl">
                {spotlight.collection_id ?? "Studio Series"}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {spotlight.description ??
                  "Each drop is cut in small batches with natural fabrics, finished by hand, and tested for real movement."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="uppercase tracking-[0.2em]">
                  {spotlightHighlights[0]}
                </Badge>
                <Badge variant="outline" className="uppercase tracking-[0.2em]">
                  {spotlightHighlights[1] ?? "Hand finished"}
                </Badge>
                <Badge variant="secondary" className="uppercase tracking-[0.2em]">
                  {spotlight.season ?? "Seasonless"}
                </Badge>
              </div>
              <div className="flex gap-3 pt-2">
                <Button asChild className="gap-2">
                  <Link to={`/products/${spotlight.slug}`}>
                    View {spotlight.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="#shop">View latest drop</a>
                </Button>
              </div>
            </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {featurePieces.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-border/70 bg-card/70 shadow-sm">
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <CardContent className="space-y-1.5 p-4">
                    <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{item.collection_id}</p>
                    <p className="text-base font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{displayPrice(item)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-6 rounded-2xl border border-border/70 bg-background/80 p-8 shadow-sm md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Quality that lasts",
                copy:
                  spotlight.care_instructions ??
                  "Staples crafted with reinforced seams and resilient fabrics so you can wear them on repeat.",
              },
              {
                icon: Leaf,
                title: "Low-impact sourcing",
                copy: "Natural blends and mindful dye houses help keep our footprint light without compromising feel.",
              },
              {
                icon: Package,
                title: "Ready to gift",
                copy: "Wrapped with care, shipped with tracking, and easy exchanges if the fit isn’t perfect.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="space-y-3 rounded-xl border border-border/70 bg-card/70 p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid gap-6 md:grid-cols-3">
            {[spotlight, secondaryLook, tertiaryLook].map((item, index) => (
              <div key={`look-${item.id}`} className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm ${index === 1 ? "md:translate-y-6" : ""}`}>
                <img
                  src={item.images?.[1] ?? item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1.5">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/80">{item.collection_id}</p>
                  <p className="text-lg font-medium text-white">{item.name}</p>
                  <p className="text-sm text-white/80">{displayPrice(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
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

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted">
              <img
                src={spotlight.images?.[0] ?? spotlight.image}
                alt={spotlight.name}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
