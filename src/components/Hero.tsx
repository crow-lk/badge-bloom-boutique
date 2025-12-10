import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/logo.jpeg";
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
        <div className="mx-auto mb-6 flex items-center justify-center">
          <img
            src={logo}
            alt="Aaliyaa logo"
            className="h-40 w-40 rounded-full object-cover shadow-2xl md:h-48 md:w-48 animate-logo-float"
          />
        </div>
        <p className="text-lg md:text-xl font-light text-muted-foreground mb-8 max-w-2xl mx-auto">
          Elegance Redefined
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
