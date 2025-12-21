import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const accountRules = [
  "You must be at least 18 years old (or have parental consent) to place an order.",
  "Keep your login credentials secure and notify us immediately if you suspect unauthorized use of your account.",
  "Provide accurate, current, and complete information at checkout. We may suspend or cancel accounts that provide false information or misuse promo codes.",
  "You agree to use the site for personal, non-commercial purposes. Purchasing products for resale without our written approval is not permitted.",
];

const orderRules = [
  "Submitting an order constitutes an offer to purchase the products listed. We accept your offer only when we send a shipping confirmation email or hand the parcel to our courier.",
  "We reserve the right to refuse or cancel any order for reasons including product availability, suspected fraud, or pricing errors. If payment was captured, it will be refunded.",
  "All prices are listed in Sri Lankan Rupees (LKR) and include applicable taxes unless stated otherwise.",
  "Payments are processed via the secure partners presented at checkout (including PayHere). You warrant that you are authorized to use the payment method provided.",
];

const productNotes = [
  "Colours and textures may vary slightly between screens and the actual garments. We take great care with photography but cannot guarantee an exact match.",
  "Quantities are limited. Adding an item to your cart does not reserve it until checkout is complete.",
  "We may modify or discontinue products without prior notice. Pricing or promotional information can change at any time.",
];

const shippingNotes = [
  "Orders placed Monday to Friday (before 2:00 p.m. IST) typically dispatch within 2–4 business days. Pre-order items include an estimated ship window on the product page (generally 10–14 days).",
  "Delivery timelines depend on your location and courier capacity. Remote deliveries within Sri Lanka may take longer than the estimates shown at checkout.",
  "Risk of loss passes to you once the parcel is delivered to the address on file or a designated collection point. Please ensure someone is available to receive it.",
];

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.28em]">
              Policies
            </Badge>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Terms &amp; Conditions</h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              These terms govern your use of aaliyaa.com and the purchase of products from AALIYAA. By accessing our
              website or placing an order, you agree to the terms below.
            </p>
          </div>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Acceptance of these terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AALIYAA may update or replace these Terms &amp; Conditions at any time by posting a revised version on
              this page. The version posted at the time you place an order will apply to that purchase. If you do not
              agree, please discontinue using the site.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Eligibility & account responsibilities</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {accountRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Orders & payments</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {orderRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Product information & availability</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {productNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Shipping & delivery</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {shippingNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              If a parcel cannot be delivered because the shipping address was entered incorrectly or no one was
              available to accept it, redelivery fees may apply.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Returns, exchanges & cancellations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our <a href="/policies/refund" className="underline hover:text-foreground">Refund Policy</a> explains when you may
              return or exchange an item. We are unable to cancel orders once they have been handed to our courier,
              but you can follow the return process after delivery.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Intellectual property & content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All photos, videos, text, graphics, logos, and other content on aaliyaa.com are owned or licensed by
              AALIYAA and protected by copyright, design, and trademark laws. You may not reproduce, distribute, or
              create derivative works without our written permission.
            </p>
            <p className="text-sm text-muted-foreground">
              By submitting reviews, messages, or styling requests, you grant us a non-exclusive, royalty-free license
              to use that content (in anonymized form) for marketing or support purposes.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Limitation of liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the fullest extent permitted by Sri Lankan law, AALIYAA shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the website or purchase
              of our products. Our total liability for any claim will not exceed the amount you paid for the specific
              order giving rise to that claim.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Governing law & contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms &amp; Conditions are governed by the laws of Sri Lanka. Any dispute shall first be addressed
              in good faith with our customer care team; if unresolved, the matter may be brought before the courts of
              Colombo. Questions about these terms can be sent to{" "}
              <a href="mailto:info@aaliyaa.com" className="underline hover:text-foreground">
                info@aaliyaa.com
              </a>{" "}
              or{" "}
              <a href="tel:+94703363363" className="underline hover:text-foreground">
                +94 70 336 3363
              </a>
              .
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
