import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCartCurrency, useCart } from "@/hooks/use-cart";
import { fallbackProducts, Product, useProducts } from "@/hooks/use-products";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { updateCartItem, removeCartItem } from "@/lib/cart";
import { useMemo, useState } from "react";

const Cart = () => {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [removingId, setRemovingId] = useState<number | string | null>(null);

  const { data: cart, isLoading } = useCart();
  const { data: productData } = useProducts();
  const cartItems = cart?.items ?? [];
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
                        <th className="px-3 py-3 text-left">Unit price</th>
                        <th className="px-3 py-3 text-left">Quantity</th>
                        <th className="px-3 py-3 text-left">Line total</th>
                        <th className="px-3 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cartEntries.map((item) => {
                        const lineTotal = item.lineTotal;
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
                                      await updateCartItem(item.id, item.quantity - 1);
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
                                <span className="w-8 text-center font-mono text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted px-1 font-semibold transition hover:bg-muted/80"
                                  onClick={async () => {
                                    if (updatingId) return;
                                    setUpdatingId(item.id);
                                    try {
                                      await updateCartItem(item.id, item.quantity + 1);
                                      await queryClient.invalidateQueries({ queryKey: ["cart"] });
                                    } catch {
                                      // ignore
                                    } finally {
                                      setUpdatingId(null);
                                    }
                                  }}
                                  disabled={updatingId === item.id}
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
                                    await removeCartItem(item.id);
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
                <Button className="px-6" disabled={!totalItemCount}>
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
