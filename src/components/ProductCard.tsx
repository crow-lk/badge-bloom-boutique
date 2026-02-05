import MintpayBreakdown from "@/components/MintpayBreakdown";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  priceValue?: number | null;
  sizes?: string[];
  slug?: string;
}

const ProductCard = ({ image, name, price, priceValue, sizes, slug }: ProductCardProps) => {
  const sizeLabel = sizes?.length ? sizes.join(" · ") : "Sizes available";

  const card = (
    <Card className="group relative h-full overflow-hidden border-0 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-background/85 via-background/30 to-transparent opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="w-full p-4 text-sm text-foreground">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sizes: {sizeLabel}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-light tracking-wide text-foreground">{name}</h3>
        <div className="space-y-1">
          <p className="text-sm font-light text-muted-foreground">{price}</p>
          <MintpayBreakdown price={priceValue} />
          {/* <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sizes: {sizeLabel}</p> */}
        </div>
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
