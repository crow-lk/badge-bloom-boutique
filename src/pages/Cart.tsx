import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCartCurrency, useCart } from "@/hooks/use-cart";
import { fallbackProducts, Product, useProducts } from "@/hooks/use-products";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { updateCartItem, removeCartItem } from "@/lib/cart";
import { getStoredToken } from "@/lib/auth";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Cart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [removingId, setRemovingId] = useState<number | string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<number | string, string>>({});

  const { data: cart, isLoading } = useCart();
  const { data: productData } = useProducts();
  const cartItems = useMemo(() => cart?.items ?? [], [cart?.items]);
  const normalizedEntries = useMemo(
    () =>
      cartItems.map((item) => {
        const fallbackLineTotal =
          item.price != null && item.quantity ? Number((item.price * item.quantity).toFixed(2)) : undefined;
        return { ...item, lineTotal: item.lineTotal ?? fallbackLineTotal };
      }),
    [cartItems],
  );
  const productLookup = useMemo(() => {
    const map = new Map<number | string, Product>();
    const products = productData ?? fallbackProducts;
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [productData]);
  const cartEntries = useMemo(
    () =>
      normalizedEntries.map((entry) => {
        const product = productLookup.get(entry.productId ?? entry.id);
        
        return {
          ...entry,
          image: entry.image ?? product?.images?.[0],
          name: product?.name ?? entry.name,
        };
      }),
    [normalizedEntries, productLookup],
  );
  const derivedTotal = cartEntries.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const serverTotal = Number.isFinite(cart?.total ?? NaN) ? cart?.total ?? 0 : 0;
  const showTotal =
    cartEntries.length > 0 ? (derivedTotal > 0 ? derivedTotal : serverTotal) : 0;
  const totalLabel = formatCartCurrency(showTotal, cart?.currency ?? "LKR");
  const totalItemCount = cartEntries.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    if (!totalItemCount) return;
    const token = getStoredToken();
    if (!token) {
      toast.message("Sign in to checkout", {
        description: "Log in and we'll bring you back here to finish your order.",
      });
      navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    navigate("/checkout");
  };

  const getAvailableVariants = (product: Product | undefined) => {
    if (!product?.variants) return [];
    return product.variants.filter(v => v.status === 'active' && v.quantity > 0);
  };

  const getAvailableQuantityForSize = (product: Product | undefined, sizeName?: string) => {
    if (!product?.variants || !sizeName) return 0;
    const variant = product.variants.find(v => v.size_name === sizeName);
    return variant?.quantity ?? 0;
  };

  const handleSizeChange = async (itemId: number | string, cartItemId: number | string | undefined, newSize: string, productVariantId: number | string) => {
    if (updatingId) return;
    if (!cartItemId) {
      toast.error("Unable to update: cart item ID missing");
      return;
    }
    
    setSelectedSizes(prev => ({ ...prev, [itemId]: newSize }));
    
    setUpdatingId(itemId);
    try {
      // Update the cart item with the new variant
      await updateCartItem(cartItemId, undefined, productVariantId);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Size updated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update size";
      toast.error(errorMessage);
      // Revert the selected size
      setSelectedSizes(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Bag</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Your shopping cart</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Review your selections, adjust quantities, or continue shopping.
            </p>
          </div>

          <Card className="space-y-6 border border-border bg-card/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Items in bag</p>
                <p className="text-lg font-medium text-foreground">{totalItemCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Subtotal</p>
                <p className="text-lg font-medium text-foreground">{totalLabel}</p>
              </div>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading bag contents…</p>
              ) : cartEntries.length ? (
                <div className="overflow-x-auto rounded-2xl border border-border/60 bg-background/90">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-background/70 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3 text-left">Product</th>
                        <th className="px-3 py-3 text-left">Size</th>
                        <th className="px-3 py-3 text-left">Unit price</th>
                        <th className="px-3 py-3 text-left">Quantity</th>
                        <th className="px-3 py-3 text-left">Line total</th>
                        <th className="px-3 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cartEntries.map((item) => {
                        const lineTotal = item.lineTotal;
                        const product = productLookup.get(item.productId ?? item.id);
                        const availableVariants = getAvailableVariants(product);
                        const currentSize = selectedSizes[item.id] || item.sizeName;
                        const currentVariantQuantity = getAvailableQuantityForSize(product, currentSize);
                        
                        return (
                          <tr key={`${item.id}`} className="bg-card/60">
                            <td className="px-3 py-3 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-16 w-16 flex-shrink-0 rounded-2xl border border-border/40 bg-muted/30">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={`${item.name} preview`}
                                      className="h-full w-full rounded-2xl object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                      N/A
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  {item.variant && (
                                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{item.variant}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">
                              {availableVariants.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  <Select
                                    value={currentSize || ""}
                                    onValueChange={(sizeValue) => {
                                      const selectedVariant = availableVariants.find(v => v.size_name === sizeValue);
                                      if (selectedVariant?.id) {
                                        handleSizeChange(item.id, item.cartItemId, sizeValue, selectedVariant.id);
                                      }
                                    }}
                                    disabled={updatingId === item.id}
                                  >
                                    <SelectTrigger className="h-8 w-24 text-[10px]">
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableVariants.map((variant) => (
                                        <SelectItem
                                          key={`${item.id}-${variant.size_name}`}
                                          value={variant.size_name || ""}
                                        >
                                          {variant.size_name} ({variant.quantity})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-[10px] text-muted-foreground">
                                    Available: {currentVariantQuantity}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground">No sizes</p>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top">
                              {item.price != null
                                ? formatCartCurrency(item.price, cart?.currency ?? "LKR")
                                : "Price on request"}
                            </td>
                            <td className="px-3 py-3 align-top text-center">
                              <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-card px-2 py-1 text-[10px]">
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted px-1 font-semibold transition hover:bg-muted/80"
                                  onClick={async () => {
                                    if (updatingId) return;
                                    if (item.quantity <= 1) return;
                                    setUpdatingId(item.id);
                                    try {
                                      await updateCartItem(item.cartItemId || item.id, item.quantity - 1);
                                      await queryClient.invalidateQueries({ queryKey: ["cart"] });
                                    } catch {
                                      // ignore
                                    } finally {
                                      setUpdatingId(null);
                                    }
                                  }}
                                  disabled={updatingId === item.id}
                                >
                                  -
                                </button>
                                <span className="inline-flex h-8 w-8 items-center justify-center font-mono text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted px-1 font-semibold transition hover:bg-muted/80"
                                  onClick={async () => {
                                    if (updatingId) return;
                                    if (item.quantity >= currentVariantQuantity) {
                                      toast.error(`Maximum available quantity is ${currentVariantQuantity}`);
                                      return;
                                    }
                                    setUpdatingId(item.id);
                                    try {
                                      await updateCartItem(item.cartItemId || item.id, item.quantity + 1);
                                      await queryClient.invalidateQueries({ queryKey: ["cart"] });
                                    } catch {
                                      // ignore
                                    } finally {
                                      setUpdatingId(null);
                                    }
                                  }}
                                  disabled={updatingId === item.id || item.quantity >= currentVariantQuantity}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">
                              {lineTotal != null ? formatCartCurrency(lineTotal, cart?.currency ?? "LKR") : "—"}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <button
                                className="text-[11px] font-semibold uppercase tracking-[0.35em] text-destructive transition hover:text-destructive/70"
                                onClick={async () => {
                                  if (removingId) return;
                                  setRemovingId(item.id);
                                  try {
                                    await removeCartItem(item.cartItemId || item.id);
                                    await queryClient.invalidateQueries({ queryKey: ["cart"] });
                                  } catch {
                                    // ignore
                                  } finally {
                                    setRemovingId(null);
                                  }
                                }}
                                disabled={removingId === item.id}
                              >
                                {removingId === item.id ? "Removing…" : "Remove"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing in your bag yet.</p>
              )}
            </div>
            <div className="flex flex-col gap-4 border-t border-border/40 pt-4 text-sm font-medium text-foreground">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <span>Subtotal</span>
                <span>{totalLabel}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to="/shop" className="text-xs uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground">
                  Continue shopping
                </Link>
                <Button className="px-6" type="button" onClick={handleCheckoutClick} disabled={!totalItemCount}>
                  Proceed to checkout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
