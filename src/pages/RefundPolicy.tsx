import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const refundNeedToKnow = [
  "Return requests must be submitted within 7 calendar days of receiving your parcel (based on the courier delivery timestamp).",
  "Pieces must be unworn, unwashed, unaltered, and returned with the original garment tags, packaging, and hygiene seals intact.",
  "Refunds are issued to the original payment method; shipping fees and cash-on-delivery charges are not refundable unless we shipped an incorrect or faulty item.",
  "We can arrange exchanges or store credit when the style you want is still in stock. Otherwise a refund will be processed once your return is approved.",
];

const returnSteps = [
  "Email info@aaliyaa.com or message us on WhatsApp (+94 70 336 3363) within 7 days, quoting your order number, the item you would like to return, and whether you prefer a refund, exchange, or store credit. Please attach photos if the item arrived damaged or defective.",
  "Keep the item in its original condition while we confirm eligibility. Our team replies within one business day and will let you know if additional information is needed.",
  "Once approved, we will share the return address for our Colombo studio and (if requested) book a reverse courier on your behalf. Ship the parcel within 48 hours of receiving the instructions and send us the tracking receipt.",
  "When the piece arrives, we inspect it within 2 business days. You will receive a confirmation email once the refund, exchange, or store credit has been issued.",
];

const nonReturnableItems = [
  "Hair accessories, earrings, bodysuits, intimates, face masks, and any product that cannot be resold for hygiene reasons.",
  "Sample-sale or marked-down “Last Chance” styles.",
  "Gift cards and store credit purchases.",
  "Custom alterations or made-to-measure items requested via email.",
];

const exchangeNotes = [
  "We can hold the requested size or style for up to 3 days after approving your return request. After that window, the item is released back into inventory.",
  "If the requested exchange is no longer available, we will issue store credit for the full item value so you can shop the next drop.",
  "Exchanged items are dispatched once we confirm that your original item is in transit to us.",
];

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.28em]">
              Policies
            </Badge>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Refunds & Returns</h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              Every capsule is produced in limited batches. This policy explains how we handle refunds, exchanges, and
              store credit for purchases made through aaliyaa.com.
            </p>
          </div>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Need-to-know overview</h2>
            <p className="text-sm text-muted-foreground">
              We want online shopping to feel as considered as an in-studio appointment. Keep the following guidelines
              in mind whenever you order from us.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {refundNeedToKnow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-6">
            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Eligibility & timelines</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Returns are available for full-priced apparel purchased through our website and delivered within Sri
                Lanka. For international orders (when available), please email us so we can advise on logistics before
                shipping.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Return requests must be submitted within 7 calendar days of delivery or pickup.</li>
                <li>Items must be in new condition without perfume, makeup, or signs of wear.</li>
                <li>All original garment tags, accessories, and branded packaging must be included.</li>
                <li>
                  Pre-order or made-to-order pieces can be exchanged for store credit only unless they arrive damaged or
                  faulty.
                </li>
              </ul>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">How to start a return</h2>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {returnSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground">
                Please do not ship parcels back to us without receiving a Return Authorization email—this ensures your
                package is labeled correctly and processed quickly.
              </p>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Refunds, exchanges & store credit</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once your return passes inspection, we will issue the approved resolution within 5–7 business days.
                Banks, card issuers, and PayHere (Pvt) Ltd may take additional time to reflect the credit on your
                statement.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Refunds are sent to the original payment method. Delivery fees are refundable only if we made an error.</li>
                <li>Store credit is delivered as a digital code that remains valid for 6 months.</li>
                <li>We will notify you by email once the refund or credit has been released.</li>
              </ul>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-sm font-medium">Exchanges</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {exchangeNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Items that cannot be returned</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {nonReturnableItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                If an item was clearly marked as &quot;Final Sale&quot; on the product page, it is not eligible for
                return or exchange.
              </p>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Damaged or incorrect items</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If your order arrives damaged, defective, or incorrect, contact us within 48 hours of delivery with your
                order number and clear photos of the issue. We will prioritize a replacement or a full refund and cover
                any return shipping fees.
              </p>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Return shipping</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customers are responsible for returning items using a reliable, trackable courier unless we made a
                mistake with your order. You can book your own courier or ask us to schedule one and deduct the courier
                fee from your refund. The final return address will be shared in the approval email so we can direct
                parcels to the correct studio location.
              </p>
            </Card>

            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium tracking-tight">Questions?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our customer care team is available Monday to Friday, 10:00–18:00 IST. Reach us any time at{" "}
                <a href="mailto:info@aaliyaa.com" className="underline hover:text-foreground">
                  info@aaliyaa.com
                </a>{" "}
                or call/WhatsApp{" "}
                <a href="tel:+94703363363" className="underline hover:text-foreground">
                  +94 70 336 3363
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
