const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
          <div>
            <h3 className="text-lg font-light tracking-wider mb-4 text-foreground">Aaliyaa</h3>
            <p className="text-sm text-muted-foreground font-light">
              Timeless pieces, crafted with intention. Reach out anytime — we&apos;re here to help style your next look.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-light">
              <li>
                <a href="tel:+94703363363" className="hover:text-foreground transition-colors">
                  Phone: 0703363363
                </a>
              </li>
              <li>
                <a href="mailto:info@aaliyaa.com" className="hover:text-foreground transition-colors">
                  Email: info@aaliyaa.com
                </a>
              </li>
              <li className="text-sm text-muted-foreground">Address: coming soon</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-light">
              <li>
                <a href="/shop" className="hover:text-foreground transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/collections" className="hover:text-foreground transition-colors">
                  Collections
                </a>
              </li>
              <li>
                <a href="/account" className="hover:text-foreground transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:text-foreground transition-colors">
                  Profile
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground font-light">© 2024 Aaliyaa. All rights reserved.</p>
          <p className="text-xs text-muted-foreground font-light mt-1">Powered by crow.lk</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
