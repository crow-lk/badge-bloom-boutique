import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const infoWeCollect = [
  {
    title: "Identity & contact details",
    description:
      "Name, email address, phone number, shipping address, and billing information that you provide when creating an account, joining our insider list, or completing checkout.",
  },
  {
    title: "Order information",
    description:
      "Items purchased, preferred sizes, delivery notes, and communications related to your purchase, return, or exchange.",
  },
  {
    title: "Payment details",
    description:
      "Cardholder information is processed securely by PayHere (Pvt) Ltd and other trusted payment processors. We never store your full card number or CVV on our servers.",
  },
  {
    title: "Device & usage data",
    description:
      "IP address, browser type, device identifiers, session duration, and pages viewed, collected via cookies and similar technologies to help us improve site performance.",
  },
  {
    title: "Communications",
    description:
      "Messages you send via email, contact forms, WhatsApp, or social channels, plus information you volunteer when taking part in surveys or events.",
  },
];

const howWeUseData = [
  "Process, deliver, and keep you updated on your orders and pre-orders.",
  "Provide personalized recommendations, back-in-stock alerts, and appointment availability.",
  "Respond to support requests, returns, and styling inquiries in a timely manner.",
  "Operate, secure, and optimize our website, including troubleshooting, testing, and analytics.",
  "Send marketing communications (only when you opt in) about new capsules, events, or promotions.",
  "Prevent fraudulent transactions and protect our business and customers.",
  "Comply with legal obligations, tax requirements, and requests from public authorities.",
];

const serviceProviders = [
  "Payment processors such as PayHere (Pvt) Ltd or banks that securely handle card transactions and digital wallets.",
  "Fulfilment teams, logistics partners, or courier companies who deliver your parcel.",
  "Technology partners who provide cloud hosting, analytics, communications, or customer support tools.",
  "Professional advisers (legal, accounting, financial) when reasonably necessary for compliance.",
  "Government authorities or law enforcement when disclosure is required by applicable law.",
];

const userRights = [
  "Request access to the personal data we hold about you.",
  "Ask us to correct inaccurate or incomplete information.",
  "Request deletion of your data where it is no longer needed (subject to legal retention requirements).",
  "Withdraw consent for marketing communications at any time by clicking “unsubscribe” or emailing us.",
  "Object to certain processing activities or ask us to restrict how we use your information.",
  "Request a copy of your data in a portable format.",
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.28em]">
              Policies
            </Badge>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Privacy Policy</h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              This policy describes how AALIYAA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects
              your personal information when you interact with aaliyaa.com, our social channels, and our customer care team.
            </p>
          </div>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">The data we collect</h2>
            <p className="text-sm text-muted-foreground">
              We only collect the information that helps us run our business, fulfill your orders, or deliver a better
              experience. This includes:
            </p>
            <ul className="space-y-3">
              {infoWeCollect.map((item) => (
                <li key={item.title} className="rounded-lg border border-border/60 bg-background/60 p-4">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">How and why we use your data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We process your information under legitimate interests, to perform a contract, or with your consent when
              required by law. In practice, that means we use your information to:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {howWeUseData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Sharing with trusted partners</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never sell your data. We only share what is necessary with service providers who help us operate the
              business. All partners are obliged to keep your information secure and use it solely for the agreed
              services.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {serviceProviders.map((provider) => (
                <li key={provider}>{provider}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              Some partners are located outside Sri Lanka. When data leaves the country, we rely on contractual and
              technical safeguards to keep it protected.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Cookies & analytics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use essential cookies to keep our site secure and functioning, plus optional analytics cookies to learn
              how visitors browse new releases. You can adjust your browser settings to block cookies, but some features
              (such as account login or cart reminders) may not work correctly.
            </p>
            <p className="text-sm text-muted-foreground">
              When you subscribe to our insider list, we may use pixel-based tracking to see whether our emails are
              opened so that we can send relevant messages only.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Data retention & security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We keep your information for as long as necessary to provide the services you request, comply with legal
              obligations, resolve disputes, and enforce our agreements. We store data on secure cloud infrastructure
              with restricted access, encryption in transit, and regular monitoring.
            </p>
            <p className="text-sm text-muted-foreground">
              If you close your account, we delete or anonymize your personal data unless we need to retain certain records
              for tax, fraud-prevention, or regulatory reasons.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Your choices & rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Depending on where you live, you may have some or all of the following rights over your personal data:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {userRights.map((right) => (
                <li key={right}>{right}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              Email{" "}
              <a href="mailto:info@aaliyaa.com" className="underline hover:text-foreground">
                info@aaliyaa.com
              </a>{" "}
              to exercise these rights. We may need to verify your identity before fulfilling a request.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Children&apos;s privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AALIYAA does not knowingly collect information from children under 16. If you believe a child has provided
              us with their data without parental consent, please contact us and we will delete the information promptly.
            </p>
          </Card>

          <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-medium tracking-tight">Updates & contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this policy to reflect new regulations or services. The &quot;last updated&quot; date will
              appear at the top of the page. Continuing to use the site after changes take effect means you accept the
              revised policy.
            </p>
            <p className="text-sm text-muted-foreground">
              Questions about privacy? Email{" "}
              <a href="mailto:info@aaliyaa.com" className="underline hover:text-foreground">
                info@aaliyaa.com
              </a>{" "}
              or call{" "}
              <a href="tel:+94703363363" className="underline hover:text-foreground">
                +94 70 336 3363
              </a>
              . We aim to reply within one business day.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
