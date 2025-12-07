import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProfile, updateProfile, updateProfilePassword, type AuthUser } from "@/lib/auth";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type ProfileFormState = {
  name: string;
  email: string;
  mobile: string;
};

type PasswordFormState = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

const defaultProfile: ProfileFormState = {
  name: "",
  email: "",
  mobile: "",
};

const defaultPassword: PasswordFormState = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

const Profile = () => {
  const [profileState, setProfileState] = useState<ProfileFormState>(defaultProfile);
  const [passwordState, setPasswordState] = useState<PasswordFormState>(defaultPassword);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const hydrateProfile = (user: AuthUser | null) => {
    if (!user) return;
    setProfileState((prev) => ({
      ...prev,
      name: user.name ? String(user.name) : prev.name,
      email: user.email ? String(user.email) : prev.email,
      mobile: user.mobile ? String(user.mobile) : prev.mobile,
    }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = await fetchProfile();
        hydrateProfile(user);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load profile.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileChange = (field: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setProfileState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPasswordState((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        name: profileState.name,
        email: profileState.email,
        mobile: profileState.mobile || undefined,
      });
      hydrateProfile(updated);
      toast.success("Profile updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update profile.";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordState.password !== passwordState.password_confirmation) {
      toast.error("New password and confirmation must match.");
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfilePassword(passwordState);
      toast.success("Password updated.");
      setPasswordState(defaultPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update password.";
      toast.error(message);
    } finally {
      setSavingPassword(false);
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

          <Card className="border-border/70 bg-card/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium tracking-tight">Profile</h2>
                <p className="text-sm text-muted-foreground">Edit your name, email, and mobile number.</p>
              </div>
              {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
            </div>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={profileState.name}
                    onChange={handleProfileChange("name")}
                    placeholder="Aaliya Noor"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={profileState.mobile}
                    onChange={handleProfileChange("mobile")}
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
                  value={profileState.email}
                  onChange={handleProfileChange("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-sm text-muted-foreground">Changes save to your profile immediately.</p>
                <Button type="submit" className="min-w-[140px]" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-border/70 bg-card/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium tracking-tight">Password</h2>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordState.current_password}
                  onChange={handlePasswordChange("current_password")}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordState.password}
                    onChange={handlePasswordChange("password")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm new password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordState.password_confirmation}
                    onChange={handlePasswordChange("password_confirmation")}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-sm text-muted-foreground">Use at least 8 characters with numbers or symbols.</p>
                <Button type="submit" className="min-w-[160px]" disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Update password"}
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
