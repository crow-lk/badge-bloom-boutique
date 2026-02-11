import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { filterActiveProducts } from "@/lib/product-status";
import { fallbackProducts, useProducts, getProductDisplayPrice } from "@/hooks/use-products";
import ProductCard from "./ProductCard";

const loadingSlots = Array.from({ length: 4 });

const ProductGrid = () => {
  const { data, isLoading, isError } = useProducts();

  const products = data?.length ? data : !isLoading ? fallbackProducts : [];
  const visibleProducts = filterActiveProducts(products);

  return (
    <section id="shop" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4 text-foreground">New Arrivals</h2>
          <p className="text-muted-foreground font-light">Curated pieces for effortless style</p>
          <div className="mt-4 flex justify-center">
            <a
              href="/products/all"
              className="text-sm font-light text-primary underline-offset-4 transition hover:underline"
            >
              View all products
            </a>
          </div>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Couldn&apos;t reach the product API</AlertTitle>
            <AlertDescription>Showing placeholder pieces until the connection comes back.</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 md:justify-items-stretch lg:grid-cols-4">
          {isLoading && !products.length
            ? loadingSlots.map((_, index) => (
                <div key={`product-skeleton-${index}`} className="space-y-4">
                  <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            : visibleProducts.map((product) => (
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
      </div>
    </section>
  );
};

export default ProductGrid;
