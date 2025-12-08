import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.28em]">
              ABOUT AALIYAA
            </Badge>
            <h1 className="text-3xl font-light tracking-tight md:text-4xl">Designed for timeless elegance</h1>
            <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
              Everyday pieces that feel refined, effortless, and beautiful. Each drop is released in considered quantities
              so we can focus on the details that matter.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm text-center md:text-left">
              <h2 className="text-lg font-medium tracking-tight">Our philosophy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fabric, fit, and finish are at the heart of every AALIYAA piece. Each silhouette is thoughtfully chosen
                for the way it moves, breathes, and holds its shape — no fuss, just pieces you reach for again and again.
              </p>
            </Card>
            <Card className="space-y-3 border-border/70 bg-card/80 p-6 shadow-sm text-center md:text-left">
              <h2 className="text-lg font-medium tracking-tight">Considered batches</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We release limited batches to keep quality high and waste low. You get fresh, timeless staples without
                endless seasons or overproduction.
              </p>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-start">
            <Card className="space-y-4 border-border/70 bg-card/80 p-6 shadow-sm text-center md:text-left">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Heritage</Badge>
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">AALIYAA Studio</p>
              </div>
              <h3 className="text-2xl font-light tracking-tight">Inspired in Sri Lanka, loved everywhere.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "At AALIYAA, our design philosophy is rooted in timeless elegance and modern femininity. Each collection
                is thoughtfully developed in Sri Lanka and produced through trusted global partners who share our
                commitment to quality, craftsmanship, and consistency."
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-border/60 bg-background/60 p-4 shadow-none">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Materials</p>
                  <p className="mt-1 text-sm text-foreground">
                    "High-quality fabrics selected for comfort, drape, and longevity."
                  </p>
                </Card>
                <Card className="border-border/60 bg-background/60 p-4 shadow-none">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Finishing</p>
                  <p className="mt-1 text-sm text-foreground">
                    "Every piece reflects careful attention to detail, from refined trims to thoughtfully considered
                    construction."
                  </p>
                </Card>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/70 bg-card/80 p-6 shadow-sm">
                <h3 className="text-lg font-medium tracking-tight">What to expect</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Limited drops you can preview and reserve early.</li>
                  <li>• Effortless silhouettes that dress up or down.</li>
                  <li>• Direct support from our team for sizing and styling help.</li>
                </ul>
              </Card>
              <Card className="border-border/70 bg-card/80 p-6 shadow-sm">
                <h3 className="text-lg font-medium tracking-tight">Stay close</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Follow our releases and in-studio events. The best pieces move quickly, and we love to host our
                  community first.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
