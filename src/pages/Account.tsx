import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredUser } from "@/lib/auth";
import {
  createShippingAddress,
  deleteShippingAddress,
  fetchShippingAddresses,
  makeDefaultShippingAddress,
  updateShippingAddress,
  type ShippingAddress,
} from "@/lib/shipping";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type AddressFormState = {
  id?: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const defaultState: AddressFormState = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Sri Lanka",
  isDefault: true,
};

const Account = () => {
  const user = useMemo(() => getStoredUser(), []);
  const [formState, setFormState] = useState<AddressFormState>(defaultState);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingDefault, setUpdatingDefault] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const setFromAddress = (address: ShippingAddress | null) => {
    const base = { ...defaultState };
    const next: AddressFormState = address
      ? {
          id: address.id,
          label: address.label ?? "Home",
          recipientName: address.recipient_name ?? "",
          phone: address.phone ?? "",
          addressLine1: address.address_line1 ?? "",
          addressLine2: address.address_line2 ?? "",
          city: address.city ?? "",
          state: address.state ?? "",
          postalCode: address.postal_code ?? "",
          country: address.country ?? "",
          isDefault: Boolean(address.is_default),
        }
      : {
          ...base,
          recipientName: (user?.name as string) || "",
        };
    setFormState(next);
  };

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchShippingAddresses();
      setAddresses(data);
      setFromAddress(data[0] ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load addresses.";
      toast.error(message);
      setFromAddress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (field: keyof AddressFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        label: formState.label || "Home",
        recipient_name: formState.recipientName,
        phone: formState.phone,
        address_line1: formState.addressLine1,
        address_line2: formState.addressLine2,
        city: formState.city,
        state: formState.state,
        postal_code: formState.postalCode,
        country: formState.country,
        is_default: formState.isDefault,
      };

      if (formState.id) {
        await updateShippingAddress(formState.id, payload);
        toast.success("Address updated.");
      } else {
        await createShippingAddress(payload);
        toast.success("Address added.");
      }

      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save address.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: ShippingAddress) => {
    setFromAddress(address);
  };

  const handleMakeDefault = async (id: number) => {
    setUpdatingDefault(id);
    try {
      await makeDefaultShippingAddress(id);
      await loadAddresses();
      toast.success("Default address updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to set default address.";
      toast.error(message);
    } finally {
      setUpdatingDefault(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteShippingAddress(id);
      toast.success("Address removed.");
      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove address.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Account</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Manage your details</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Keep your profile and shipping details up to date so checkout is effortless.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="space-y-5 border-border/70 bg-card/80 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium tracking-tight">Shipping address</h2>
                    <p className="text-sm text-muted-foreground">
                      Default address we’ll prefill during checkout. Mark one as default to speed up your orders.
                    </p>
                  </div>
                  <Badge variant="outline">{formState.isDefault ? "Default" : "Secondary"}</Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      value={formState.label}
                      onChange={handleChange("label")}
                      placeholder="Home, Studio, Office"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient name</Label>
                    <Input
                      id="recipientName"
                      value={formState.recipientName}
                      onChange={handleChange("recipientName")}
                      placeholder="Aaliya Noor"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange("phone")}
                    placeholder="+94 77 123 4567"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address line 1</Label>
                  <Input
                    id="addressLine1"
                    value={formState.addressLine1}
                    onChange={handleChange("addressLine1")}
                    placeholder="123 Galle Road"
                    autoComplete="address-line1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
                  <Input
                    id="addressLine2"
                    value={formState.addressLine2}
                    onChange={handleChange("addressLine2")}
                    placeholder="Apartment, suite, etc."
                    autoComplete="address-line2"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formState.city}
                      onChange={handleChange("city")}
                      placeholder="Colombo"
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formState.state}
                      onChange={handleChange("state")}
                      placeholder="Western Province"
                      autoComplete="address-level1"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      id="postalCode"
                      value={formState.postalCode}
                      onChange={handleChange("postalCode")}
                      placeholder="00100"
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formState.country}
                      onChange={handleChange("country")}
                      placeholder="Sri Lanka"
                      autoComplete="country-name"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" className="min-w-[140px]" disabled={saving}>
                    {saving ? "Saving..." : formState.id ? "Update address" : "Save address"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setFromAddress(null)}
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4" />
                    New address
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {formState.isDefault ? "This will remain your default shipping address." : "Save first, then set default."}
                  </p>
                </div>
              </Card>

              <Card className="space-y-4 border-border/70 bg-card/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium tracking-tight">Saved addresses</h2>
                    <p className="text-sm text-muted-foreground">Default address appears first.</p>
                  </div>
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
                </div>

                {addresses.length === 0 && !loading ? (
                  <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                    No shipping addresses yet. Add one to speed through checkout.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`rounded-xl border p-4 ${
                          address.is_default ? "border-primary/60 bg-primary/5" : "border-border/70 bg-card/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{address.label}</p>
                              {address.is_default && <Badge variant="secondary">Default</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.recipient_name} • {address.phone}
                            </p>
                            <p className="text-sm text-foreground">
                              {address.address_line1}
                              {address.address_line2 ? `, ${address.address_line2}` : ""}
                            </p>
                            <p className="text-sm text-foreground">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(address)} disabled={saving}>
                              Edit
                            </Button>
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMakeDefault(address.id)}
                                disabled={updatingDefault === address.id || saving}
                              >
                                {updatingDefault === address.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Make default"
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(address.id)}
                              disabled={deletingId === address.id || saving}
                            >
                              {deletingId === address.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
