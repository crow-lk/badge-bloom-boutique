import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const ComingSoon = () => {
  const [email, setEmail] = useState("");

  const handleNotify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Add an email so we can keep you posted.");
      return;
    }

    toast.success("Thanks! We'll let you know as soon as we launch.");
    setEmail("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-14">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="Aaliyaa logo" className="h-60 w-60 rounded-full object-cover shadow-2xl" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Aaliyaa is coming soon</h1>
            <p className="text-base font-light text-muted-foreground md:text-lg">We&apos;re getting ready. Drop your email to be notified.</p>
          </div>

          <form onSubmit={handleNotify} className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="bg-card/70 text-base backdrop-blur md:text-lg"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="group px-7 bg-card text-foreground shadow-md transition-colors hover:bg-card/90"
            >
              Notify me
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
