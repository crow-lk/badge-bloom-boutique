import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  clearMintpayCheckout,
  fetchMintpayStatus,
  loadMintpayCheckout,
  placeOrder,
  type PaymentStatusResponse,
} from "@/lib/checkout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const resolvePaymentStatus = (payload?: PaymentStatusResponse) => {
  const raw =
    payload?.payment_status ??
    payload?.status ??
    payload?.payment?.status ??
    payload?.payment?.payment_status;
  return raw ? String(raw).toLowerCase() : null;
};

const MintpaySuccess = () => {
  const navigate = useNavigate();
  const [storedCheckout] = useState(() => loadMintpayCheckout());
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const paymentId = storedCheckout?.payment_id;
  const purchaseId = storedCheckout?.purchase_id;

  const paymentStatusQuery = useQuery({
    queryKey: ["mintpay-status", paymentId, purchaseId],
    queryFn: () => fetchMintpayStatus(paymentId as string | number, purchaseId),
    enabled: Boolean(paymentId),
    refetchInterval: (data) => {
      const status = resolvePaymentStatus(data);
      return status === "paid" || status === "failed" ? false : 4000;
    },
  });

  const paymentStatus = useMemo(
    () => resolvePaymentStatus(paymentStatusQuery.data),
    [paymentStatusQuery.data],
  );

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      setOrderCreated(true);
      clearMintpayCheckout();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to finalize your order.";
      setOrderError(message);
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!storedCheckout || startedRef.current) return;
    if (paymentStatus !== "paid") return;
    startedRef.current = true;
    placeOrderMutation.mutate({
      payment_id: storedCheckout.payment_id,
      payment_method_id: storedCheckout.payment_method_id,
      shipping: storedCheckout.shipping,
      billing: storedCheckout.billing ?? storedCheckout.shipping,
      shipping_total: storedCheckout.shipping_total,
      notes: storedCheckout.notes,
      currency: storedCheckout.currency,
      session_id: storedCheckout.session_id,
    });
  }, [paymentStatus, placeOrderMutation, storedCheckout]);

  const showFailure =
    !orderCreated &&
    (paymentStatus === "failed" || (orderError && !placeOrderMutation.isPending));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Mintpay</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Processing your payment</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              We&apos;re confirming your Mintpay transaction and creating your order.
            </p>
          </div>

          <Card className="space-y-4 border-border/70 bg-card/80 p-6 text-center shadow-sm">
            {!storedCheckout ? (
              <>
                <XCircle className="mx-auto h-10 w-10 text-destructive" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Checkout session missing</p>
                  <p className="text-sm text-muted-foreground">
                    We couldn&apos;t locate your Mintpay session. Return to checkout to try again.
                  </p>
                </div>
                <Button onClick={() => navigate("/checkout")}>Back to checkout</Button>
              </>
            ) : showFailure ? (
              <>
                <XCircle className="mx-auto h-10 w-10 text-destructive" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Payment not completed</p>
                  <p className="text-sm text-muted-foreground">
                    {orderError ?? "Mintpay reported a failed payment. Please try again."}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={() => navigate("/checkout")}>Retry payment</Button>
                  <Button variant="outline" onClick={() => navigate("/cart")}>
                    Review cart
                  </Button>
                </div>
              </>
            ) : orderCreated ? (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Order confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    Your Mintpay payment is complete and the order is now in our system.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={() => navigate("/")}>Continue shopping</Button>
                  <Button variant="outline" onClick={() => navigate("/account")}>
                    View account
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Finalizing order</p>
                  <p className="text-sm text-muted-foreground">
                    Please stay on this page while we confirm the payment.
                  </p>
                </div>
              </>
            )}
            {storedCheckout && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Badge variant="outline">
                  Payment ID: {String(storedCheckout.payment_id)}
                </Badge>
                {storedCheckout.purchase_id ? (
                  <Badge variant="outline">Purchase ID: {storedCheckout.purchase_id}</Badge>
                ) : null}
                <Badge variant="outline">Status: {paymentStatus ?? "pending"}</Badge>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MintpaySuccess;
