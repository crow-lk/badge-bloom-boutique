import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { persistAuth, register as registerUser, socialLogin, type SocialProvider } from "@/lib/auth";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await registerUser(name, email, password, phone);
      persistAuth(response, true);
      toast.success(`Welcome, ${response.user?.name ?? response.user?.email ?? "you"}!`);
      navigate("/shop");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create your account.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    const accessToken =
      window
        .prompt(`Paste the ${provider} access token from your provider SDK to continue:`)
        ?.trim() ?? "";

    if (!accessToken) {
      toast.error("A provider access token is required to continue.");
      return;
    }

    setSocialProvider(provider);
    try {
      const response = await socialLogin(provider, accessToken);
      persistAuth(response, true);
      toast.success(`Signed in via ${provider}`);
      navigate("/shop");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with social login.";
      toast.error(message);
    } finally {
      setSocialProvider(null);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Build wishlists, track orders, and join members-only drops in a few clicks."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <span>Already have an account?</span>
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Aaliya Noor"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+94 77 123 4567"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters with a mix of letters, numbers, or symbols.
          </p>
        </div>

        <Button type="submit" className="w-full justify-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <SocialAuthButtons
        label="Or join with"
        onSelect={handleSocialLogin}
        loadingProvider={socialProvider}
        disabled={isSubmitting}
      />
    </AuthLayout>
  );
};

export default Register;
