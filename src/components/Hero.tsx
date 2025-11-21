import heroImage from "@/assets/hero-image.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/40" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-light tracking-wider mb-6 text-foreground">
          Minimalist Elegance
        </h2>
        <p className="text-lg md:text-xl font-light text-muted-foreground mb-8 max-w-2xl mx-auto">
          Timeless pieces crafted for the modern wardrobe
        </p>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-light tracking-wide px-8"
        >
          Explore Collection
        </Button>
      </div>
    </section>
  );
};

export default Hero;
