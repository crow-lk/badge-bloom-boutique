import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/aaliyaa_logo.png";
import { Button } from "@/components/ui/button";
import { fetchHeroImageUrls } from "@/lib/settings";
import { Link } from "react-router-dom";


const SLIDESHOW_INTERVAL = 3500; // ms

const Hero = () => {
  const [heroUrls, setHeroUrls] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadHeroImages = async () => {
      try {
        const { image_urls, mobile_image_urls } = await fetchHeroImageUrls(controller.signal);
        if (!isActive) return;
        // Use mobile images if on mobile, else desktop
        if (isMobile && mobile_image_urls && mobile_image_urls.length > 0) {
          setHeroUrls(mobile_image_urls);
        } else if (image_urls && image_urls.length > 0) {
          setHeroUrls(image_urls);
        } else {
          setHeroUrls([heroImage]);
        }
      } catch (error) {
        if (!isActive) return;
        setHeroUrls([heroImage]);
        console.warn("Unable to load hero image settings.", error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadHeroImages();

    return () => {
      isActive = false;
      controller.abort();
    };
  // Re-run when isMobile changes
  }, [isMobile]);

  // Slideshow effect
  useEffect(() => {
    if (heroUrls.length <= 1) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIdx((idx) => (idx + 1) % heroUrls.length);
    }, SLIDESHOW_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [heroUrls]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-busy={isLoading}>
      <div className="absolute inset-0 w-full h-full">
        {heroUrls.map((url, idx) => (
          <img
            key={url}
            src={url}
            alt={`Hero Slide ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              idx === currentIdx ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />
        ))}
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
        {/* Dots navigation */}
        {heroUrls.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {heroUrls.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentIdx ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
