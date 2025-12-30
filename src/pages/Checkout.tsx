import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatCartCurrency, useCart } from "@/hooks/use-cart";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { initiatePayment, placeOrder, type CheckoutAddress, type PaymentMethod, type PaymentRecord } from "@/lib/checkout";
import { fetchShippingAddresses, type ShippingAddress } from "@/lib/shipping";
import { getStoredToken, getStoredUser, type AuthUser } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, ExternalLink, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";

const DEFAULT_COUNTRY = "Sri Lanka";

type AddressFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type OrderResult = Record<string, unknown> | null;

type RequiredField = {
  key: keyof AddressFormState;
  label: string;
};

const requiredFields: RequiredField[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "addressLine1", label: "Address line 1" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
];

const parseUserName = (value?: string | null) => {
  if (!value) {
    return { first: "", last: "" };
  }
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

const buildDefaultAddress = (user: AuthUser | null): AddressFormState => {
  const { first, last } = parseUserName((user?.name as string) ?? "");
  return {
    firstName: first,
    lastName: last,
    email: (user?.email as string) ?? "",
    phone: (user?.mobile as string) ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: DEFAULT_COUNTRY,
  };
};

const toCheckoutAddress = (form: AddressFormState): CheckoutAddress => ({
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  address_line1: form.addressLine1.trim(),
  address_line2: form.addressLine2.trim() || undefined,
  city: form.city.trim(),
  state: form.state.trim() || undefined,
  postal_code: form.postalCode.trim() || undefined,
  country: form.country.trim() || DEFAULT_COUNTRY,
});

const fromSavedAddress = (address: ShippingAddress, fallbackEmail = ""): AddressFormState => {
  const { first, last } = parseUserName(address.recipient_name ?? "");
  return {
    firstName: first || address.recipient_name || "",
    lastName: last,
    email: fallbackEmail,
    phone: address.phone ?? "",
    addressLine1: address.address_line1 ?? "",
    addressLine2: address.address_line2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postalCode: address.postal_code ?? "",
    country: address.country ?? DEFAULT_COUNTRY,
  };
};

const formatSavedAddress = (address: ShippingAddress) =>
  [address.address_line1, address.address_line2, address.city, address.state, address.postal_code, address.country]
    .filter(Boolean)
    .join(", ");

const stringifyValue = (value: unknown) => (typeof value === "string" && value.trim().length ? value : undefined);

const extractRedirectUrl = (checkout: Record<string, unknown>): string | null => {
  const directKeys = [
    "redirect_url",
    "redirectUrl",
    "url",
    "checkout_url",
    "payment_url",
    "gateway_url",
    "href",
    "action",
  ];

  for (const key of directKeys) {
    const candidate = stringifyValue(checkout[key]);
    if (candidate) return candidate;
  }

  const linkRecords = [checkout.link, checkout.links, checkout.meta, checkout.redirect];
  for (const entry of linkRecords) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const candidate = stringifyValue(record[key]);
      if (candidate) return candidate;
      const nested = record[key];
      if (nested && typeof nested === "object") {
        const nestedRecord = nested as Record<string, unknown>;
        const nestedCandidate = stringifyValue(
          nestedRecord.url ?? nestedRecord.href ?? nestedRecord.action ?? nestedRecord.redirect_url,
        );
        if (nestedCandidate) return nestedCandidate;
      }
    }
  }

  return null;
};

const Checkout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [authReady, setAuthReady] = useState(false);
  const storedUser = useMemo(() => getStoredUser(), []);
  const [shippingForm, setShippingForm] = useState<AddressFormState>(() => buildDefaultAddress(storedUser));
  const [billingForm, setBillingForm] = useState<AddressFormState>(() => buildDefaultAddress(storedUser));
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const shippingEmailRef = useRef(shippingForm.email);
  useEffect(() => {
    shippingEmailRef.current = shippingForm.email;
  }, [shippingForm.email]);
  const billingSameRef = useRef(billingSameAsShipping);
  useEffect(() => {
    billingSameRef.current = billingSameAsShipping;
  }, [billingSameAsShipping]);
  const [notes, setNotes] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult>(null);

  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();

  const cartItems = cart?.items ?? [];
  const currency = cart?.currency ?? "LKR";
  const derivedTotal = cartItems.reduce((sum, item) => {
    const fallbackLineTotal = item.lineTotal ?? (item.unitPrice ?? item.price ?? 0) * item.quantity;
    return sum + (fallbackLineTotal ?? 0);
  }, 0);
  const totalLabel = formatCartCurrency(cart?.total ?? derivedTotal, currency);
  const subtotalLabel = formatCartCurrency(cart?.subtotal ?? derivedTotal, currency);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const itemsDescription = useMemo(() => {
    if (!cartItems.length) return "";
    return cartItems
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");
  }, [cartItems]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      toast.message("Sign in to checkout", {
        description: "Log in to continue. We'll return you to checkout afterward.",
      });
      const redirectTarget = location.pathname + location.search || "/checkout";
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, { replace: true });
      return;
    }
    setAuthReady(true);
  }, [location.pathname, location.search, navigate]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              Preparing checkout...
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  useEffect(() => {
    if (!selectedPaymentMethodId && paymentMethods?.length) {
      setSelectedPaymentMethodId(String(paymentMethods[0].id));
    }
  }, [paymentMethods, selectedPaymentMethodId]);

  useEffect(() => {
    let cancelled = false;
    const loadSavedAddresses = async () => {
      if (!storedUser) return;
      const token = getStoredToken();
      if (!token) return;
      setLoadingSavedAddresses(true);
      try {
        const addresses = await fetchShippingAddresses();
        if (cancelled) return;
        setSavedAddresses(addresses);
        const preferred = addresses.find((address) => address.is_default) ?? addresses[0];
        if (preferred) {
          const nextState = fromSavedAddress(preferred, shippingEmailRef.current);
          setShippingForm(nextState);
          if (billingSameRef.current) {
            setBillingForm(nextState);
          }
          setSelectedAddressId(preferred.id);
        }
      } catch (error) {
        if (!cancelled) {
          setSavedAddresses([]);
          const message = error instanceof Error ? error.message : "Unable to load saved addresses.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedAddresses(false);
        }
      }
    };
    loadSavedAddresses();
    return () => {
      cancelled = true;
    };
  }, [storedUser]);

  const handleAddressChange = (section: "shipping" | "billing", field: keyof AddressFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (section === "shipping") {
        if (selectedAddressId !== null) {
          setSelectedAddressId(null);
        }
        setShippingForm((prev) => ({ ...prev, [field]: value }));
        if (billingSameAsShipping) {
          setBillingForm((prev) => ({ ...prev, [field]: value }));
        }
      } else {
        setBillingForm((prev) => ({ ...prev, [field]: value }));
      }
    };

  const validateAddress = (form: AddressFormState) => {
    const missing = requiredFields.filter((field) => {
      const value = form[field.key];
      return !value || !value.trim();
    });
    if (missing.length) {
      const label = missing[0]?.label ?? "field";
      toast.error(`${label} is required to continue.`);
      return false;
    }
    return true;
  };

  const handleApplySavedAddress = (address: ShippingAddress) => {
    const nextState = fromSavedAddress(address, shippingForm.email);
    setShippingForm(nextState);
    if (billingSameAsShipping) {
      setBillingForm(nextState);
    }
    setSelectedAddressId(address.id);
  };

  const selectedPaymentMethod: PaymentMethod | null = useMemo(() => {
    if (!paymentMethods?.length || !selectedPaymentMethodId) return null;
    return paymentMethods.find((method) => String(method.id) === selectedPaymentMethodId) ?? null;
  }, [paymentMethods, selectedPaymentMethodId]);

  const canCheckout = cartItems.length > 0 && !cartLoading;

  const handleInitiatePayment = async () => {
    if (!canCheckout) {
      toast.error("Add items to your bag before checking out.");
      return;
    }
    const addressValid = validateAddress(shippingForm);
    if (!addressValid) return;
    if (!selectedPaymentMethod) {
      toast.error("Choose a payment method to continue.");
      return;
    }

    setIsInitiating(true);
    try {
      const paymentResponse = await initiatePayment({
        payment_method_id: selectedPaymentMethod.id,
        customer: {
          first_name: shippingForm.firstName.trim(),
          last_name: shippingForm.lastName.trim(),
          email: shippingForm.email.trim(),
          phone: shippingForm.phone.trim(),
          address: [shippingForm.addressLine1, shippingForm.addressLine2].filter(Boolean).join(", "),
          city: shippingForm.city.trim(),
          country: shippingForm.country.trim() || DEFAULT_COUNTRY,
        },
        items_description: itemsDescription || undefined,
      });
      setPaymentRecord(paymentResponse.payment);
      const nextRedirectUrl = extractRedirectUrl(paymentResponse.checkout);
      setRedirectUrl(nextRedirectUrl);
      toast.success(paymentResponse.message ?? "Payment initialized.");
      if (nextRedirectUrl) {
        const popup = window.open(nextRedirectUrl, "_blank", "noopener,noreferrer");
        if (!popup) {
          toast.info("Follow the payment link in a new tab.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to initiate payment.";
      toast.error(message);
    } finally {
      setIsInitiating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentRecord) {
      toast.error("Initiate payment before placing your order.");
      return;
    }
    const shippingValid = validateAddress(shippingForm);
    if (!shippingValid) return;
    const billingValid = billingSameAsShipping ? true : validateAddress(billingForm);
    if (!billingValid) return;

    setIsPlacingOrder(true);
    try {
      const response = await placeOrder({
        payment_id: paymentRecord.id,
        shipping: toCheckoutAddress(shippingForm),
        billing: billingSameAsShipping ? undefined : toCheckoutAddress(billingForm),
        notes: notes.trim() || undefined,
        payment_method_id: selectedPaymentMethod?.id,
      });
      setOrderResult(response.order ?? {});
      toast.success(response.message ?? "Order placed successfully.");
      setNotes("");
      setPaymentRecord(null);
      setRedirectUrl(null);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to place the order.";
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const summaryLines = [
    { label: "Subtotal", value: subtotalLabel },
    { label: "Items", value: `${totalItems}` },
    { label: "Total", value: totalLabel },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Checkout</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Order placement</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Review your bag, add your preferred address, and confirm payment in a couple of guided steps.
            </p>
          </div>

          <Card className="border-border/70 bg-card/70 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Review bag", description: "Double-check sizes and quantities before paying." },
                { title: "Secure payment", description: "Share your contact details and follow the payment link from your selected method." },
                { title: "Order confirmation", description: "We'll confirm the order and email the summary once payment succeeds." },
              ].map((step) => (
                <div key={step.title} className="rounded-2xl border border-border/40 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{step.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-8">
              {orderResult && (
                <Alert className="border-emerald-500/40 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-500/10">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Order placed</AlertTitle>
                  <AlertDescription className="space-y-1 text-sm">
                    {orderResult.order_number && <p>Order number: {String(orderResult.order_number)}</p>}
                    {orderResult.grand_total && <p>Total paid: {String(orderResult.grand_total)}</p>}
                    {orderResult.payment_status && <p>Status: {String(orderResult.payment_status)}</p>}
                    <p className="text-muted-foreground">
                      You&apos;ll receive a confirmation email shortly. Track the order from your account dashboard.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {paymentRecord && (
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle>Payment initialized</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      Reference <span className="font-semibold">{paymentRecord.reference_number ?? paymentRecord.id}</span> - Amount{" "}
                      {String(paymentRecord.amount_paid ?? "--")}
                    </p>
                    <p className="text-muted-foreground">
                      Complete the payment at the gateway. Once it succeeds, return here and place the order using the stored payment id.
                    </p>
                    {redirectUrl && (
                      <Button variant="outline" size="sm" className="mt-1 inline-flex items-center gap-2" onClick={() => {
                        const popup = window.open(redirectUrl, "_blank", "noopener,noreferrer");
                        if (!popup) toast.info("Enable pop-ups to open the payment link.");
                      }}>
                        Open payment link
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Card className="space-y-6 border-border/70 bg-card/80 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-medium tracking-tight">Contact & shipping</h2>
                  <p className="text-sm text-muted-foreground">We&apos;ll use these details for the payment request and dispatch label.</p>
                </div>
                {loadingSavedAddresses ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                    Loading saved addresses...
                  </div>
                ) : savedAddresses.length ? (
                  <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Saved addresses</p>
                        <p className="text-xs text-muted-foreground">Select one to autofill the form.</p>
                      </div>
                      <Link to="/account" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
                        Manage
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {savedAddresses.map((address) => {
                        const isSelected = selectedAddressId === address.id;
                        return (
                          <div
                            key={address.id}
                            className={`rounded-2xl border p-4 ${isSelected ? "border-foreground" : "border-border/60"}`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">{address.label || "Address"}</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{address.recipient_name}</p>
                              </div>
                              {address.is_default && <Badge variant="outline">Default</Badge>}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{formatSavedAddress(address)}</p>
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className="mt-3"
                              onClick={() => handleApplySavedAddress(address)}
                            >
                              {isSelected ? "Using this address" : "Use this address"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : storedUser ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                    Save an address in your account to reuse it here.
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-first-name">First name</Label>
                    <Input id="shipping-first-name" value={shippingForm.firstName} onChange={handleAddressChange("shipping", "firstName")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-last-name">Last name</Label>
                    <Input id="shipping-last-name" value={shippingForm.lastName} onChange={handleAddressChange("shipping", "lastName")} required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-email">Email</Label>
                    <Input id="shipping-email" type="email" value={shippingForm.email} onChange={handleAddressChange("shipping", "email")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-phone">Phone</Label>
                    <Input id="shipping-phone" value={shippingForm.phone} onChange={handleAddressChange("shipping", "phone")} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-address1">Address line 1</Label>
                  <Input id="shipping-address1" value={shippingForm.addressLine1} onChange={handleAddressChange("shipping", "addressLine1")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-address2">Address line 2 (optional)</Label>
                  <Input id="shipping-address2" value={shippingForm.addressLine2} onChange={handleAddressChange("shipping", "addressLine2")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-city">City</Label>
                    <Input id="shipping-city" value={shippingForm.city} onChange={handleAddressChange("shipping", "city")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-state">State / Province</Label>
                    <Input id="shipping-state" value={shippingForm.state} onChange={handleAddressChange("shipping", "state")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-postal">Postal code</Label>
                    <Input id="shipping-postal" value={shippingForm.postalCode} onChange={handleAddressChange("shipping", "postalCode")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country</Label>
                  <Input id="shipping-country" value={shippingForm.country} onChange={handleAddressChange("shipping", "country")} required />
                </div>
              </Card>

              <Card className="space-y-6 border-border/70 bg-card/80 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium tracking-tight">Billing</h2>
                    <p className="text-sm text-muted-foreground">Optional - only needed if the payer address differs from shipping.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      id="billing-same"
                      checked={billingSameAsShipping}
                      onCheckedChange={(checked) => {
                        const next = Boolean(checked);
                        setBillingSameAsShipping(next);
                        if (next) {
                          setBillingForm({ ...shippingForm });
                        }
                      }}
                    />
                    Same as shipping
                  </label>
                </div>

                {!billingSameAsShipping && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billing-first-name">First name</Label>
                        <Input id="billing-first-name" value={billingForm.firstName} onChange={handleAddressChange("billing", "firstName")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing-last-name">Last name</Label>
                        <Input id="billing-last-name" value={billingForm.lastName} onChange={handleAddressChange("billing", "lastName")} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billing-email">Email</Label>
                        <Input id="billing-email" value={billingForm.email} onChange={handleAddressChange("billing", "email")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing-phone">Phone</Label>
                        <Input id="billing-phone" value={billingForm.phone} onChange={handleAddressChange("billing", "phone")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-address1">Address line 1</Label>
                      <Input id="billing-address1" value={billingForm.addressLine1} onChange={handleAddressChange("billing", "addressLine1")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-address2">Address line 2</Label>
                      <Input id="billing-address2" value={billingForm.addressLine2} onChange={handleAddressChange("billing", "addressLine2")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="billing-city">City</Label>
                        <Input id="billing-city" value={billingForm.city} onChange={handleAddressChange("billing", "city")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing-state">State / Province</Label>
                        <Input id="billing-state" value={billingForm.state} onChange={handleAddressChange("billing", "state")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing-postal">Postal code</Label>
                        <Input id="billing-postal" value={billingForm.postalCode} onChange={handleAddressChange("billing", "postalCode")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-country">Country</Label>
                      <Input id="billing-country" value={billingForm.country} onChange={handleAddressChange("billing", "country")} />
                    </div>
                  </div>
                )}
              </Card>

              <Card className="space-y-6 border-border/70 bg-card/80 p-6 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium tracking-tight">Payment method</h2>
                  <p className="text-sm text-muted-foreground">Choose how you&apos;d like to pay. We&apos;ll open the secure gateway when you continue.</p>
                </div>
                {paymentMethodsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading payment methods...</p>
                ) : paymentMethods?.length ? (
                  <RadioGroup value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId} className="space-y-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        htmlFor={`payment-method-${method.id}`}
                        className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border/60 bg-background/60 p-4"
                      >
                        <RadioGroupItem
                          id={`payment-method-${method.id}`}
                          value={String(method.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold">{method.name}</p>
                          {method.provider && (
                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{method.provider}</p>
                          )}
                          {method.instructions && (
                            <p className="mt-1 text-sm text-muted-foreground">{String(method.instructions)}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>No payment methods</AlertTitle>
                    <AlertDescription>Configure payment methods in the admin to continue.</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="checkout-notes">Order notes (optional)</Label>
                  <Textarea
                    id="checkout-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Delivery notes or styling preferences"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="flex-1 min-w-[180px]"
                    onClick={handleInitiatePayment}
                    disabled={isInitiating || !canCheckout || paymentMethodsLoading}
                  >
                    {isInitiating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating...
                      </>
                    ) : (
                      <>
                        Initiate payment
                        <CreditCard className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-w-[180px]"
                    onClick={handlePlaceOrder}
                    disabled={!paymentRecord || isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        Place order
                        <ShoppingBag className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </section>

            <aside className="space-y-6">
              <Card className="space-y-4 border-border/70 bg-card/60 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-medium tracking-tight">Order summary</h2>
                  <p className="text-sm text-muted-foreground">Your bag updates instantly as you adjust quantities.</p>
                </div>
                {cartLoading ? (
                  <p className="text-sm text-muted-foreground">Loading your bag...</p>
                ) : cartItems.length ? (
                  <div className="divide-y divide-border/60">
                    {cartItems.map((item) => (
                      <div key={String(item.id)} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCartCurrency(
                            item.lineTotal ?? (item.unitPrice ?? item.price ?? 0) * item.quantity,
                            currency,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                )}
                <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                  {summaryLines.map((line) => (
                    <div key={line.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{line.label}</span>
                      <span className="font-medium">{line.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="space-y-3 border-border/70 bg-card/60 p-6 shadow-sm text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Need help?</p>
                    <p>Email info@aaliyaa.com or call 0703363363. Share your payment reference for faster support.</p>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
