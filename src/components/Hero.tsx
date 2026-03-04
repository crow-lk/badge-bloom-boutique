import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImage from "@/assets/hero-image.jpg";
import { fetchHeroImageUrls } from "@/lib/settings";

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
  }, [isMobile]);

  // Slideshow effect
  useEffect(() => {
    if (heroUrls.length <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIdx((idx) => (idx + 1) % heroUrls.length);
    }, SLIDESHOW_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroUrls]);

  const goToSlide = (idx: number) => {
    setCurrentIdx(idx);
    // Reset interval on manual navigation
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (heroUrls.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((i) => (i + 1) % heroUrls.length);
      }, SLIDESHOW_INTERVAL);
    }
  };

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "calc(100vh - 72px)" }}
      aria-busy={isLoading}
    >
      {/* Slides */}
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
        {/* Loading overlay */}
        <div
          className={`absolute inset-0 bg-muted/50 transition-opacity duration-500 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Dots Navigation — bottom-center, above the fold */}
      {heroUrls.length > 1 && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-3"
          role="tablist"
          aria-label="Slideshow navigation"
        >
          {heroUrls.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIdx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goToSlide(idx)}
              className={[
                "relative rounded-full transition-all duration-500 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                idx === currentIdx
                  ? "w-8 h-4 bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.7)]"
                  : "w-4 h-4 bg-white/50 hover:bg-white/80 hover:scale-110",
              ].join(" ")}
            >
              {/* Pulse ring on active dot */}
              {idx === currentIdx && (
                <span
                  className="absolute inset-0 rounded-full bg-white/40 animate-ping"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
