import MintpayBreakdown from "@/components/MintpayBreakdown";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDiscounts, applyDiscountToPrice } from "@/hooks/use-discounts";
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
  const { data: discounts } = useDiscounts();
  const sizeLabel = sizes?.length ? sizes.join(" · ") : "Sizes available";

  const { discountedPrice, appliedDiscount } = applyDiscountToPrice(priceValue ?? null, discounts ?? []);
  const hasDiscount = discountedPrice != null && appliedDiscount != null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const card = (
    <Card className="group relative h-full overflow-hidden border-0 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[3/4] overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            -{appliedDiscount?.discount_percentage}%
          </Badge>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-background/85 via-background/30 to-transparent opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="w-full p-4 text-sm text-foreground">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sizes: {sizeLabel}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-light tracking-wide text-foreground">{name}</h3>
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              <p className="text-sm font-light text-foreground">
                <span>{formatPrice(discountedPrice)}</span>
                <span className="ml-2 line-through decoration-destructive/70 text-muted-foreground">{price}</span>
              </p>
              <MintpayBreakdown price={discountedPrice} />
            </>
          ) : (
            <>
              <p className="text-sm font-light text-muted-foreground">{price}</p>
              <MintpayBreakdown price={priceValue} />
            </>
          )}
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
