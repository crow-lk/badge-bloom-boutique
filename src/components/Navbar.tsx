import { ShoppingBag } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-light tracking-wider text-foreground">ESSENCE</h1>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#shop" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
              Shop
            </a>
            <a href="#about" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          <button className="text-foreground hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
