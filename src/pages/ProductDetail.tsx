import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import coatImage from "@/assets/product-coat.jpg";
import pantsImage from "@/assets/product-pants.jpg";
import sweaterImage from "@/assets/product-sweater.jpg";
import tshirtImage from "@/assets/product-tshirt.jpg";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

type Product = {
  name: string;
  slug: string;
  sku_prefix: string;
  selling_price: number;
  brand_id: string;
  category_id: string;
  collection_id: string;
  season: string;
  description: string;
  care_instructions: string;
  material_composition: string;
  hs_code: string;
  default_tax_id: string;
  status: string;
  images: string[];
  highlights: string[];
};

const catalog: Product[] = [
  {
    name: "Essential T-Shirt",
    slug: "essential-t-shirt",
    sku_prefix: "AL-TSH",
    selling_price: 45,
    brand_id: "Aaliyaa Atelier",
    category_id: "Tops",
    collection_id: "Foundations",
    season: "All-season",
    description: "A featherlight organic cotton tee cut with a clean crew neckline for effortless layering. Moves with you and holds its shape all day.",
    care_instructions: "Machine wash cold inside out. Lay flat to dry. Cool iron if needed. Avoid bleach to preserve color.",
    material_composition: "95% Organic Cotton, 5% Elastane",
    hs_code: "6109.10.00",
    default_tax_id: "TAX-AL-01",
    status: "Active",
    images: [tshirtImage, sweaterImage, pantsImage, coatImage],
    highlights: ["Breathable jersey knit", "Designed for layering"],
  },
  {
    name: "Linen Trousers",
    slug: "linen-trousers",
    sku_prefix: "AL-LIN",
    selling_price: 89,
    brand_id: "Aaliyaa Atelier",
    category_id: "Bottoms",
    collection_id: "Resort",
    season: "Spring/Summer",
    description: "Relaxed straight-leg linen trousers with a clean waistband, hidden side zip, and airy drape. Tailored to sit just right on the hip.",
    care_instructions: "Hand wash cold or gentle cycle. Hang to dry and steam to release creases. Do not tumble dry.",
    material_composition: "70% Linen, 30% Organic Cotton",
    hs_code: "6204.69.00",
    default_tax_id: "TAX-AL-02",
    status: "Active",
    images: [pantsImage, coatImage, tshirtImage, sweaterImage],
    highlights: ["Cooling linen blend", "Travel-ready crease release"],
  },
  {
    name: "Wool Coat",
    slug: "wool-coat",
    sku_prefix: "AL-WLC",
    selling_price: 198,
    brand_id: "Aaliyaa Atelier",
    category_id: "Outerwear",
    collection_id: "Heritage",
    season: "Fall/Winter",
    description: "Double-faced wool coat with minimalist lapels and a belt that shapes the waist without bulk. Fully lined for warmth without weight.",
    care_instructions: "Dry clean only. Store on a wide hanger. Use a fabric brush to keep the wool fresh between wears.",
    material_composition: "80% Responsible Wool, 20% Recycled Polyester",
    hs_code: "6202.91.00",
    default_tax_id: "TAX-AL-03",
    status: "Active",
    images: [coatImage, pantsImage, sweaterImage, tshirtImage],
    highlights: ["Warmth without weight", "Lined for smooth layering"],
  },
  {
    name: "Knit Sweater",
    slug: "knit-sweater",
    sku_prefix: "AL-KNT",
    selling_price: 75,
    brand_id: "Aaliyaa Atelier",
    category_id: "Knitwear",
    collection_id: "Lounge",
    season: "All-season",
    description: "Soft ribbed knit with a subtle mock neck and draped sleeves. Finished with clean cuffs that stay in place as you move.",
    care_instructions: "Hand wash cold, reshape, and dry flat. Store folded to maintain the rib structure.",
    material_composition: "60% Cotton, 30% Viscose, 10% Recycled Nylon",
    hs_code: "6110.30.00",
    default_tax_id: "TAX-AL-04",
    status: "Preorder",
    images: [sweaterImage, tshirtImage, pantsImage, coatImage],
    highlights: ["Pill-resistant yarn", "Draped sleeves, clean cuffs"],
  },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const product = useMemo(
    () => catalog.find((item) => item.slug === slug) ?? catalog[0],
    [slug],
  );

  const [activeImage, setActiveImage] = useState(product.images[0]);

  useEffect(() => {
    setActiveImage(product.images[0]);
  }, [product]);

  const relatedProducts = useMemo(
    () => catalog.filter((item) => item.slug !== product.slug).slice(0, 3),
    [product.slug],
  );

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

          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <Card className="overflow-hidden border-0 bg-card shadow-sm">
                <div className="relative">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  </div>

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="backdrop-blur">
                      {product.collection_id} collection
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 backdrop-blur">
                      {product.season}
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
                  <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
                </div>
                <Badge variant={product.status.toLowerCase() === "active" ? "outline" : "secondary"}>
                  {product.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-light">{formatPrice(product.selling_price)}</span>
                <Badge variant="secondary">{product.brand_id}</Badge>
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
                <Spec label="SKU prefix" value={product.sku_prefix} />
                <Spec label="Category" value={product.category_id} />
                <Spec label="Collection" value={product.collection_id} />
                <Spec label="Season" value={product.season} />
                <Spec label="HS code" value={product.hs_code} />
                <Spec label="Default tax ID" value={product.default_tax_id} />
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
                  <Detail title="Material" value={product.material_composition} />
                  <Detail title="Brand" value={product.brand_id} />
                  <Detail title="Category" value={product.category_id} />
                  <Detail title="Season" value={product.season} />
                  <Detail title="Collection" value={product.collection_id} />
                  <Detail title="Status" value={product.status} />
                </div>
                <Separator className="my-6" />
                <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              </Card>
            </TabsContent>

            <TabsContent value="care">
              <Card className="border-0 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium tracking-wide text-foreground">Care instructions</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.care_instructions}</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logistics">
              <Card className="border-0 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="grid gap-4 md:grid-cols-3">
                  <Detail title="HS code" value={product.hs_code} />
                  <Detail title="Default tax ID" value={product.default_tax_id} />
                  <Detail title="SKU prefix" value={product.sku_prefix} />
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
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{item.collection_id}</p>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <h4 className="text-lg font-light tracking-wide">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.selling_price)}</p>
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

export default ProductDetail;
