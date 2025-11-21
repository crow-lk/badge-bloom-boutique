import ProductCard from "./ProductCard";
import tshirtImage from "@/assets/product-tshirt.jpg";
import pantsImage from "@/assets/product-pants.jpg";
import coatImage from "@/assets/product-coat.jpg";
import sweaterImage from "@/assets/product-sweater.jpg";

const products = [
  { id: 1, name: "Essential T-Shirt", price: "$45", image: tshirtImage },
  { id: 2, name: "Linen Trousers", price: "$89", image: pantsImage },
  { id: 3, name: "Wool Coat", price: "$198", image: coatImage },
  { id: 4, name: "Knit Sweater", price: "$75", image: sweaterImage },
];

const ProductGrid = () => {
  return (
    <section id="shop" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4 text-foreground">
            New Arrivals
          </h2>
          <p className="text-muted-foreground font-light">
            Curated pieces for effortless style
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
