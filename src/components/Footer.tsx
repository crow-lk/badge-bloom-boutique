const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-light tracking-wider mb-4 text-foreground">ESSENCE</h3>
            <p className="text-sm text-muted-foreground font-light">
              Timeless minimalist fashion for the modern lifestyle.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-light">
              <li><a href="#shop" className="hover:text-foreground transition-colors">Shop</a></li>
              <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground font-light mb-4">
              Subscribe for updates and exclusive offers.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground font-light">
            © 2024 ESSENCE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
