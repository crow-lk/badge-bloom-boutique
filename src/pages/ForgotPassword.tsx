import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { persistAuth, socialLogin, type SocialProvider } from "@/lib/auth";
import { requestFacebookAccessToken, requestGoogleIdToken } from "@/lib/social";
import { Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Password reset link sent (UI only)");
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setSocialProvider(provider);
    try {
      const token = provider === "google" ? await requestGoogleIdToken() : await requestFacebookAccessToken();
      const response = await socialLogin(provider, token);
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
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a link to set a new password."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <span>Remembered your password?</span>
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Go to sign in
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

        <Button type="submit" className="w-full justify-center">
          Send reset link
        </Button>
      </form>

      <SocialAuthButtons
        label="Or sign in instantly"
        onSelect={handleSocialLogin}
        loadingProvider={socialProvider}
      />
    </AuthLayout>
  );
};

export default ForgotPassword;
