import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredUser } from "@/lib/auth";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
};

const STORAGE_KEY = "aaliyaa.profile.draft";

const defaultState: ProfileFormState = {
  name: "",
  email: "",
  phone: "",
};

const Profile = () => {
  const [formState, setFormState] = useState<ProfileFormState>(defaultState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let next = { ...defaultState };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        next = { ...next, ...(JSON.parse(saved) as Partial<ProfileFormState>) };
      }
    } catch {
      // ignore bad saved values
    }
    const user = getStoredUser();
    if (user) {
      next = {
        ...next,
        name: next.name || (user.name as string) || "",
        email: next.email || (user.email as string) || "",
      };
    }
    setFormState(next);
  }, []);

  const handleChange = (field: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
      }
      toast.success("Profile draft saved. Connect an API endpoint to persist this server-side.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Account</p>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Profile</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Update your name, contact email, and preferred mobile number.
            </p>
          </div>

          <Card className="border-border/70 bg-card/80 p-6 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={handleChange("name")}
                    placeholder="Aaliya Noor"
                    autoComplete="name"
                    required
                  />
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  These details are saved locally until a profile API is connected.
                </p>
                <Button type="submit" className="min-w-[140px]" disabled={saving}>
                  {saving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
