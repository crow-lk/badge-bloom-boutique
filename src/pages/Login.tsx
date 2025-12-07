import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, persistAuth, socialLogin, type SocialProvider } from "@/lib/auth";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await login(email, password);
      persistAuth(response, remember);
      const name = response.user?.name ?? response.user?.email ?? "your account";
      toast.success(`Signed in as ${name}`);
      navigate("/shop");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in right now.";
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
      persistAuth(response, remember);
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
      title="Welcome back"
      subtitle="Sign in to pick up where you left off, manage orders, and view your saved looks."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <span>New to Aaliyaa?</span>
          <Link to="/register" className="text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <label className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(Boolean(checked))}
            />
            <span>Keep me signed in</span>
          </label>
          <span className="text-xs text-muted-foreground">Secure & private</span>
        </div>

        <Button type="submit" className="w-full justify-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <SocialAuthButtons
        onSelect={handleSocialLogin}
        loadingProvider={socialProvider}
        disabled={isSubmitting}
      />
    </AuthLayout>
  );
};

export default Login;
