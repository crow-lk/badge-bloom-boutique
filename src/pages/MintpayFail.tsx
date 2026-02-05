import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearMintpayCheckout } from "@/lib/checkout";
import { XCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MintpayFail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearMintpayCheckout();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Mintpay</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Payment canceled</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Your cart is still saved. You can retry the payment whenever you&apos;re ready.
            </p>
          </div>

          <Card className="space-y-4 border-border/70 bg-card/80 p-6 text-center shadow-sm">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <div className="space-y-2">
              <p className="text-lg font-semibold">Checkout canceled</p>
              <p className="text-sm text-muted-foreground">
                If this was a mistake, you can return to checkout and choose Mintpay again.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate("/checkout")}>Retry payment</Button>
              <Button variant="outline" onClick={() => navigate("/cart")}>
                Back to cart
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MintpayFail;
