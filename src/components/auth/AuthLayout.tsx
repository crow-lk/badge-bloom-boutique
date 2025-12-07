import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/logo.jpeg";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(180,140,100,0.08),transparent_30%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-2xl backdrop-blur-lg lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-8 p-8 sm:p-10 lg:p-12">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground transition hover:text-foreground"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full border border-border/80">
                <img src={logo} alt="Aaliyaa logo" className="h-full w-full object-cover" />
              </div>
              <span>Aaliyaa</span>
            </Link>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Account</p>
              <h1 className="text-3xl font-light tracking-tight sm:text-4xl">{title}</h1>
              <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
            </div>

            <div className="space-y-8">{children}</div>

            {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
          </div>

          <div className="relative hidden lg:block">
            <img src={heroImage} alt="Fine jewelry display" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/35 to-background" />
            <div className="relative z-10 flex h-full flex-col justify-center p-10 text-white">
              <div className="max-w-md rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">Members club</p>
                <h2 className="mt-3 text-2xl font-light leading-tight">
                  Save your favorites, track orders, and unlock member-only drops.
                </h2>
                <p className="mt-3 text-sm text-white/80">
                  Social sign-in works instantly — perfect when you&apos;re on the move.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
