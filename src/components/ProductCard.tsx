import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  slug?: string;
}

const ProductCard = ({ image, name, price, slug }: ProductCardProps) => {
  const card = (
    <Card className="group h-full overflow-hidden border-0 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-light tracking-wide text-foreground">{name}</h3>
        <p className="text-sm font-light text-muted-foreground">{price}</p>
      </div>
    </Card>
  );

  return slug ? (
    <Link to={`/products/${slug}`} className="block h-full text-foreground no-underline">
      {card}
    </Link>
  ) : (
    card
  );
};

export default ProductCard;
