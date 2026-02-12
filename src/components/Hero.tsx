import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/aaliyaa_logo.png";
import { Button } from "@/components/ui/button";
import { fetchHeroImageUrl } from "@/lib/settings";
import { Link } from "react-router-dom";

const Hero = () => {
  const [heroUrl, setHeroUrl] = useState(heroImage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadHeroImage = async () => {
      try {
        const nextUrl = await fetchHeroImageUrl(controller.signal);

        if (!isActive) return;
        if (!nextUrl) {
          setIsLoading(false);
          return;
        }

        const image = new Image();
        image.onload = () => {
          if (!isActive) return;
          setHeroUrl(nextUrl);
          setIsLoading(false);
        };
        image.onerror = () => {
          if (!isActive) return;
          setIsLoading(false);
        };
        image.src = nextUrl;
      } catch (error) {
        if (!isActive) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to load hero image settings.", error);
        setIsLoading(false);
      }
    };

    loadHeroImage();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-busy={isLoading}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroUrl})` }}
      >
        <div
          className={`absolute inset-0 bg-muted/50 transition-opacity duration-500 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="mx-auto mb-6 flex items-center justify-center">
          <img
            src={logo}
            alt="Aaliyaa logo"
            className="h-40 w-40 md:h-48 md:w-48 "
          />
        </div>
        <p className="text-lg md:text-xl font-light text-muted-foreground mb-8 max-w-2xl mx-auto">
          Elegance Redefined
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-light tracking-wide px-8"
        >
          <Link to="/collections">Explore Collection</Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
