import { Card } from "@/components/ui/card";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
}

const ProductCard = ({ image, name, price }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-0 bg-card hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-light tracking-wide text-foreground mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground font-light">{price}</p>
      </div>
    </Card>
  );
};

export default ProductCard;
