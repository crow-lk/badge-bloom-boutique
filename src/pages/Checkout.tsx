import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatCartCurrency, useCart } from "@/hooks/use-cart";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { getStoredToken } from "@/lib/auth";
import {
  initiatePayment,
  placeOrder,
  storePayHereCheckout,
  type CheckoutAddress,
  type PaymentMethod,
  type PaymentCustomerInput,
} from "@/lib/checkout";
import {
  createShippingAddress,
  fetchShippingAddresses,
  type ShippingAddress,
  type ShippingPayload,
} from "@/lib/shipping";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gift, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const checkoutSteps = [
  { id: "shipping", label: "Shipping address", detail: "Confirm contact & delivery details." },
  { id: "payment", label: "Payment & notes", detail: "Select a method and review order." },
] as const;

type CheckoutStep = (typeof checkoutSteps)[number]["id"];

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

type ContactFormState = z.infer<typeof contactSchema>;

const FALLBACK_CONTACT: ContactFormState = {
  firstName: "Olivia",
  lastName: "Perera",
  email: "olivia@aaliyaa.com",
  phone: "+94 77 123 4567",
  addressLine1: "45 Flower Road",
  addressLine2: "Colombo 07",
  city: "Colombo",
  province: "Western",
  postalCode: "00700",
  country: "Sri Lanka",
};

const splitRecipientName = (value?: string | null) => {
  if (!value) return { first: "", last: "" };
  const parts = value.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

const describeAddress = (address: ShippingAddress) =>
  [address.address_line1, address.address_line2, address.city, address.state, address.postal_code, address.country]
    .filter(Boolean)
    .join(", ");

const mergeContactWithAddress = (address: ShippingAddress, prev: ContactFormState): ContactFormState => {
  const { first, last } = splitRecipientName(address.recipient_name);
  return {
    ...prev,
    firstName: first || prev.firstName,
    lastName: last || prev.lastName,
    phone: address.phone || prev.phone,
    addressLine1: address.address_line1 || "",
    addressLine2: address.address_line2 ?? "",
    city: address.city || "",
    province: address.state || "",
    postalCode: address.postal_code || "",
    country: address.country || prev.country,
  };
};

const buildShippingPayload = (form: ContactFormState, isFirstAddress: boolean): ShippingPayload => {
  const first = form.firstName.trim();
  const last = form.lastName.trim();
  const labelSource = form.addressLine1.trim() || form.city.trim() || "Address";
  return {
    label: labelSource,
    recipient_name: `${first} ${last}`.trim() || first || last || "Customer",
    phone: form.phone.trim(),
    address_line1: form.addressLine1.trim(),
    address_line2: (form.addressLine2 ?? "").trim() || undefined,
    city: form.city.trim(),
    state: (form.province ?? "").trim(),
    postal_code: (form.postalCode ?? "").trim(),
    country: form.country.trim() || "Sri Lanka",
    is_default: isFirstAddress,
  };
};

const isFiniteAmount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const REQUIRED_CONTACT_FIELDS: Array<{ key: keyof ContactFormState; label: string }> = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone number" },
  { key: "addressLine1", label: "Address line 1" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
];

const getFirstErrorLabel = (errors: FieldErrors<ContactFormState>) => {
  for (const field of REQUIRED_CONTACT_FIELDS) {
    if (errors[field.key]) return field.label;
  }
  return null;
};

const buildCheckoutAddressFromContact = (form: ContactFormState): CheckoutAddress => ({
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  address_line1: form.addressLine1.trim(),
  address_line2: (form.addressLine2 ?? "").trim() || undefined,
  city: form.city.trim(),
  state: (form.province ?? "").trim() || undefined,
  postal_code: (form.postalCode ?? "").trim() || undefined,
  country: form.country.trim() || "Sri Lanka",
});

const buildPaymentCustomerPayload = (form: ContactFormState): PaymentCustomerInput => ({
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  address: [form.addressLine1, form.addressLine2].filter(Boolean).join(", "),
  city: form.city.trim(),
  country: form.country.trim() || "Sri Lanka",
});

type RedirectCheckout = {
  actionUrl: string;
  fields: Record<string, string>;
};

const isPayHereMethod = (method: PaymentMethod) => {
  const probe = [method.slug, method.provider, method.name].filter(Boolean).join(" ").toLowerCase();
  return probe.includes("payhere");
};

const normalizeRedirectCheckout = (checkout?: Record<string, unknown> | null): RedirectCheckout | null => {
  if (!checkout) return null;
  const type = String(checkout.type ?? checkout.checkout_type ?? "").toLowerCase();
  if (type !== "redirect") return null;
  const actionUrl = String(checkout.action_url ?? checkout.actionUrl ?? checkout.url ?? "");
  if (!actionUrl) return null;
  const rawFields = checkout.fields;
  if (!rawFields || typeof rawFields !== "object") return null;
  const fields = Object.entries(rawFields as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value == null) return acc;
      acc[key] = String(value);
      return acc;
    },
    {},
  );
  return { actionUrl, fields };
};

const RedirectCheckoutForm = ({ checkout }: { checkout: RedirectCheckout | null }) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!checkout || !formRef.current) return;
    formRef.current.submit();
  }, [checkout]);

  if (!checkout) return null;

  return (
    <form ref={formRef} action={checkout.actionUrl} method="POST" className="hidden">
      {Object.entries(checkout.fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  );
};

const Checkout = () => {
  const form = useForm<ContactFormState>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      country: "",
    },
    mode: "onBlur",
  });
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const navigate = useNavigate();
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [activeStep, setActiveStep] = useState<CheckoutStep>("shipping");
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [redirectCheckout, setRedirectCheckout] = useState<RedirectCheckout | null>(null);
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    isError: paymentMethodsError,
  } = usePaymentMethods();
  const { data: cart, isLoading: cartLoading } = useCart();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAddressesError("Sign in to load saved addresses.");
      setShippingAddresses([]);
      setSelectedAddressId(null);
      form.reset(FALLBACK_CONTACT);
      setManualAddressMode(true);
      return;
    }

    let cancelled = false;
    const loadAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const addresses = await fetchShippingAddresses();
        if (cancelled) return;
        setShippingAddresses(addresses);
        setAddressesError(null);
        if (addresses.length) {
          const preferred = addresses.find((address) => address.is_default) ?? addresses[0];
          setSelectedAddressId(preferred.id);
          form.reset(mergeContactWithAddress(preferred, form.getValues()));
          setManualAddressMode(false);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unable to load shipping addresses.";
          setAddressesError(message);
          setShippingAddresses([]);
          toast.error(message);
          setManualAddressMode(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingAddresses(false);
        }
      }
    };

    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [form]);

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddressId(address.id);
    form.reset(mergeContactWithAddress(address, form.getValues()));
    setManualAddressMode(false);
  };

  const handleSaveAddress = async () => {
    const token = getStoredToken();
    if (!token) {
      toast.error("Sign in to save an address.");
      return;
    }

    const contactForm = form.getValues();
    const trimmedAddressLine1 = contactForm.addressLine1.trim();
    const trimmedCity = contactForm.city.trim();
    const trimmedPhone = contactForm.phone.trim();
    const trimmedFirst = contactForm.firstName.trim();
    if (!trimmedFirst) {
      toast.error("First name is required to save an address.");
      return;
    }
    if (!trimmedAddressLine1) {
      toast.error("Address line 1 is required to save an address.");
      return;
    }
    if (!trimmedCity) {
      toast.error("City is required to save an address.");
      return;
    }
    if (!trimmedPhone) {
      toast.error("Phone number is required to save an address.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const payload = buildShippingPayload(contactForm, shippingAddresses.length === 0);
      const saved = await createShippingAddress(payload);
      const refreshedAddresses = await fetchShippingAddresses();
      setShippingAddresses(refreshedAddresses);
      const targetAddress = refreshedAddresses.find((address) => address.id === saved.id) ?? saved;
      setSelectedAddressId(targetAddress.id);
      form.reset(mergeContactWithAddress(targetAddress, form.getValues()));
      setManualAddressMode(false);
      toast.success("Address saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save address.";
      toast.error(message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const showManualForm = manualAddressMode || (!loadingAddresses && shippingAddresses.length === 0);
  const availablePaymentMethods = paymentMethods ?? [];
  const currentStepIndex = checkoutSteps.findIndex((step) => step.id === activeStep);
  const summaryItems = useMemo(() => {
    const items = cart?.items ?? [];
    return items.map((item) => {
      const fallbackLineTotal =
        item.lineTotal ??
        (item.price != null ? Number((item.price * item.quantity).toFixed(2)) : undefined);
      return { ...item, lineTotal: fallbackLineTotal };
    });
  }, [cart?.items]);
  const orderCurrency = cart?.currency ?? "LKR";
  const cartSubtotal = cart?.subtotal;
  const cartTotal = cart?.total;
  const derivedSubtotal = summaryItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const hasSummaryItems = summaryItems.length > 0;
  const serverSubtotal = isFiniteAmount(cartSubtotal) ? cartSubtotal : undefined;
  const subtotalValue = hasSummaryItems
    ? derivedSubtotal > 0
      ? derivedSubtotal
      : serverSubtotal ?? derivedSubtotal
    : serverSubtotal ?? 0;
  const serverTotal = isFiniteAmount(cartTotal) ? cartTotal : undefined;
  const totalValue = hasSummaryItems
    ? derivedSubtotal > 0
      ? derivedSubtotal
      : serverTotal ?? derivedSubtotal
    : serverTotal ?? serverSubtotal ?? 0;
  const subtotalLabel = formatCartCurrency(subtotalValue, orderCurrency);
  const totalLabel = formatCartCurrency(totalValue, orderCurrency);

  const initiatePaymentMutation = useMutation({
    mutationFn: initiatePayment,
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
  });

  const isProcessing = Boolean(processingPaymentId) || initiatePaymentMutation.isPending || placeOrderMutation.isPending;

  const handlePaymentSelection = async (value: string) => {
    setSelectedPaymentId(value);
    if (!value) return;
    if (isProcessing) return;
    const method = availablePaymentMethods.find((entry) => String(entry.id) === value);
    if (!method) return;
    if (!summaryItems.length) {
      toast.error("Add at least one product to your bag before paying.");
      return;
    }
    const isValid = await form.trigger();
    if (!isValid) {
      const missingField = getFirstErrorLabel(form.formState.errors);
      toast.error(`${missingField ?? "Contact details"} is required before paying.`);
      setActiveStep("shipping");
      return;
    }

    const contactForm = form.getValues();
    const shippingAddress = buildCheckoutAddressFromContact(contactForm);
    const customerPayload = buildPaymentCustomerPayload(contactForm);
    const itemsDescription =
      summaryItems.map((item) => `${item.quantity}x ${item.name}`).join(", ") || "Order payment";

    setProcessingPaymentId(value);
    try {
      const isPayHere = isPayHereMethod(method);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const paymentResponse = await initiatePaymentMutation.mutateAsync({
        payment_method_id: method.id,
        customer: customerPayload,
        items_description: itemsDescription,
        return_url: isPayHere && origin ? `${origin}/payments/payhere/return` : undefined,
        cancel_url: isPayHere && origin ? `${origin}/payments/payhere/cancel` : undefined,
      });
      const paymentId = paymentResponse.payment?.id;
      if (!paymentId) {
        throw new Error("Payment gateway did not return a payment reference.");
      }
      const redirectCheckout = normalizeRedirectCheckout(
        paymentResponse.checkout as Record<string, unknown>,
      );
      if (redirectCheckout) {
        if (isPayHere) {
          storePayHereCheckout({
            payment_id: paymentId,
            payment_method_id: method.id,
            shipping: shippingAddress,
            billing: shippingAddress,
            notes: notes.trim() || undefined,
            currency: orderCurrency,
            checkout: paymentResponse.checkout as Record<string, unknown>,
            created_at: new Date().toISOString(),
          });
        }
        setRedirectCheckout(redirectCheckout);
        return;
      }

      await placeOrderMutation.mutateAsync({
        payment_id: paymentId,
        payment_method_id: method.id,
        shipping: shippingAddress,
        billing: shippingAddress,
        notes: notes.trim() || undefined,
        currency: orderCurrency,
      });
      toast.success("Order placed successfully.", {
        description: "A confirmation email is on its way to you.",
      });
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to process payment.";
      toast.error(message);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Checkout</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Finish your order</h1>
          </div>

          {/* <Card className="border-border/70 bg-card/70 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {checkoutSteps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isComplete = index < currentStepIndex;
                const stateClass = isCurrent
                  ? "border-foreground bg-muted/70 shadow-sm"
                  : isComplete
                    ? "border-foreground/60 bg-muted/30"
                    : "border-border/60 bg-background/50";
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={`space-y-2 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${stateClass}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <Badge
                      variant={isCurrent || isComplete ? "default" : "outline"}
                      className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em]"
                    >
                      Step {String(index + 1).padStart(2, "0")}
                    </Badge>
                    <p className="text-sm font-semibold">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </button>
                );
              })}
            </div>
          </Card> */}

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-6">
              {activeStep === "shipping" && (
                <Card className="space-y-5 border-border/70 bg-card/80 p-6 shadow-sm">
                  <div>
                    <h2 className="text-lg font-medium tracking-tight">Contact details</h2>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll send the confirmation to this email and phone number.
                    </p>
                  </div>
                  {loadingAddresses ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                      Loading saved addresses...
                    </div>
                  ) : addressesError ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                      {addressesError}
                    </div>
                  ) : shippingAddresses.length ? (
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Saved addresses</p>
                          <p className="text-xs text-muted-foreground">Pick one to autofill your details.</p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em]">
                          {shippingAddresses.length} saved
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {shippingAddresses.map((address) => {
                          const isSelected = selectedAddressId === address.id;
                          return (
                            <div
                              key={address.id}
                              className={`rounded-2xl border p-4 transition ${isSelected ? "border-foreground bg-muted/70 shadow-sm" : "border-border/60 bg-background/20"
                                }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{address.label || address.recipient_name || "Address"}</p>
                                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{address.recipient_name}</p>
                                </div>
                                {address.is_default && <Badge variant="outline">Default</Badge>}
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{describeAddress(address)}</p>
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className="mt-3"
                                onClick={() => handleSelectAddress(address)}
                              >
                                {isSelected ? "Using this address" : "Use this address"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                      No saved addresses yet. Add one from your account dashboard to reuse it here.
                    </div>
                  )}
                  {shippingAddresses.length > 0 && !loadingAddresses && !addressesError && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setManualAddressMode((prev) => !prev)}
                      >
                        {manualAddressMode ? "Use saved address instead" : "Send to another address"}
                      </Button>
                    </div>
                  )}
                  <Form {...form}>
                    {showManualForm && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Olivia" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Perera" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="olivia@aaliyaa.com" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+94 77 123 4567" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address line 1</FormLabel>
                              <FormControl>
                                <Input placeholder="45 Flower Road" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="addressLine2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address line 2 (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Colombo 07" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-3">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Colombo" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="Western" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="00700"
                                    className="placeholder:text-muted-foreground/60"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Sri Lanka" className="placeholder:text-muted-foreground/60" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {getStoredToken() ? (
                          <div className="flex justify-end">
                            <Button type="button" disabled={isSavingAddress} onClick={handleSaveAddress}>
                              {isSavingAddress ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save address"
                              )}
                            </Button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </Form>
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                    <p className="text-sm text-muted-foreground">
                      Ready to lock this in? Your payment choice comes next.
                    </p>
                    <Button
                      type="button"
                      className="mt-3 w-full sm:mt-0 sm:w-auto"
                      onClick={async () => {
                        const isValid = await form.trigger();
                        if (!isValid) {
                          const missingField = getFirstErrorLabel(form.formState.errors);
                          toast.error(`${missingField ?? "Contact details"} is required before proceeding.`);
                          return;
                        }
                        setActiveStep("payment");
                      }}
                    >
                      Continue to payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {activeStep === "payment" && (
                <Card className="space-y-5 border-border/70 bg-card/80 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-medium tracking-tight">Payment method</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose from the gateways configured in your dashboard. This list loads directly from the API.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStep("shipping")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Shipping
                    </Button>
                  </div>

                  {paymentMethodsLoading ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                      Loading payment methods...
                    </div>
                  ) : paymentMethodsError ? (
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                      Unable to load payment methods. Refresh the page or try again shortly.
                    </div>
                  ) : availablePaymentMethods.length ? (
                    <>
                      <RadioGroup
                        value={selectedPaymentId}
                        onValueChange={(value) => setSelectedPaymentId(value)}
                        className="space-y-3"
                      >
                        {availablePaymentMethods.map((method) => {
                          const isSelected = String(method.id) === selectedPaymentId;
                          const description =
                            (method.instructions && String(method.instructions).trim()) ||
                            (method.description && String(method.description).trim()) ||
                            `Use ${method.name} for payment`;

                          return (
                            <label
                              key={method.id}
                              htmlFor={`payment-${method.id}`}
                              className={`flex flex-col cursor-pointer gap-2 rounded-2xl border p-4 ${isSelected ? "border-foreground bg-muted/60" : "border-border/60 bg-background/60"
                                }`}
                            >
                              <div className="flex items-start gap-4">
                                <RadioGroupItem
                                  id={`payment-${method.id}`}
                                  value={String(method.id)}
                                  className="mt-1"
                                  disabled={isProcessing}
                                />
                                <div>
                                  <p className="text-sm font-semibold">{method.name}</p>
                                  {method.provider && (
                                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                                      {method.provider}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Description under each selected method */}
                              {isSelected && (
                                <div className="mt-2 rounded-2xl border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                  {description}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </RadioGroup>
                      {/* Show selected method description */}
                      {/* {selectedPaymentId && (() => {
                        const method = availablePaymentMethods.find((m) => String(m.id) === selectedPaymentId);
                        if (!method) return null;
                        const description =
                          (method.instructions && String(method.instructions).trim()) ||
                          (method.description && String(method.description).trim()) ||
                          `Use ${method.name} for payment`;
                        return (
                          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                            {description}
                          </div>
                        );
                      })()} */}

                      {/* Start Payment Button */}
                      {selectedPaymentId && (
                        <Button
                          type="button"
                          className="mt-4 w-full"
                          disabled={isProcessing}
                          onClick={() => handlePaymentSelection(selectedPaymentId)}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Order Complete"
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                      No payment methods are available yet. Configure them in the admin portal to enable checkout.
                    </div>
                  )}

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="order-notes">Order notes</Label>
                    <Textarea
                      id="order-notes"
                      placeholder="Any delivery instructions?"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>

                  {processingPaymentId && (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Hang tight—redirecting to the gateway and finalizing your order.
                    </div>
                  )}
                </Card>
              )}
            </section>

            <aside className="space-y-6">
              <Card className="space-y-4 border-border/70 bg-card/70 p-6">
                <div>
                  <h2 className="text-lg font-medium tracking-tight">Order summary</h2>
                </div>
                <div className="divide-y divide-border/60">
                  {cartLoading ? (
                    <p className="py-4 text-sm text-muted-foreground">Loading order summary…</p>
                  ) : summaryItems.length ? (
                    summaryItems.map((item) => (
                      <div key={item.id} className="space-y-1 py-3">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                          Qty {item.quantity}
                          {item.variant ? ` · ${item.variant}` : ""}
                        </p>
                        <p className="text-sm">
                          {item.lineTotal != null
                            ? formatCartCurrency(item.lineTotal, orderCurrency)
                            : "Price on request"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-sm text-muted-foreground">
                      Your bag is empty. Add a product to review totals here.
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {summaryItems.length ? subtotalLabel : formatCartCurrency(0, orderCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Calculated at payment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Included where applicable</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{summaryItems.length ? totalLabel : formatCartCurrency(0, orderCurrency)}</span>
                  </div>
                </div>
              </Card>
              <Card className="space-y-3 border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Secure sandbox</p>
                    <p>All inputs here are client-side only. Replace with live requests when the API stabilizes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Need custom copy?</p>
                    <p>Swap the placeholder paragraphs with fulfillment or showroom instructions.</p>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <RedirectCheckoutForm checkout={redirectCheckout} />
    </div>
  );
};

export default Checkout;
