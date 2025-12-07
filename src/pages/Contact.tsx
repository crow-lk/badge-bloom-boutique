import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, PhoneCall, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.28em]">
              Contact
            </Badge>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">We&apos;re here to help</h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              Questions on sizing, styling, shipping, or inquiries? Reach us anytime — we respond within one business day.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="space-y-4 border-border/70 bg-card/80 p-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-medium tracking-tight">Send us a note</h2>
                <p className="text-sm text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
              </div>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" placeholder="Aaliya Noor" autoComplete="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="info@aaliyaa.com" autoComplete="email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="0703363363" autoComplete="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your inquiry, event, or styling question."
                    className="min-h-[140px]"
                    required
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send message
                </Button>
              </form>
            </Card>

            <Card className="space-y-4 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Reach us directly</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-3">
                  <PhoneCall className="h-4 w-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <a href="tel:+94703363363" className="hover:text-foreground transition-colors">
                      0703363363
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-3">
                  <Mail className="h-4 w-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href="mailto:info@aaliyaa.com" className="hover:text-foreground transition-colors">
                      info@aaliyaa.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-3">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </div>
              <Card className="border-border/70 bg-background/60 p-4 shadow-none">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Styling requests</p>
                <p className="mt-2 text-sm text-foreground">
                  Need help pairing pieces or planning an event look? Include your sizes and occasion in the message — we&apos;ll
                  recommend a mini edit for you.
                </p>
              </Card>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
