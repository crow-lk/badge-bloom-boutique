const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
          <div>
            <h3 className="text-lg font-light tracking-wider mb-4 text-foreground">Aaliyaa</h3>
            <p className="text-sm mb-4 text-muted-foreground font-light">
              Timeless Elegance, Curated for You. Reach out anytime- We&apos;re here to help style your next look.
            </p>
            <div className="flex justify-left space-x-6 text-xl">
              <a href="https://web.facebook.com/profile.php?id=61583308148240" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/aaliyaa.official/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@aaliyaa.official?_r=1&_t=ZS-93O8eiIeBpi" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <i className="fab fa-tiktok"></i>
              </a>
          </div>
          </div>

          <div>
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
            {/* <div className="mt-6">
              <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Social Media Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>
                  <a href="https://web.facebook.com/profile.php?id=61583308148240" className="hover:text-foreground transition-colors">
                    <i className="fab fa-facebook mr-2"></i>
                    Aaliyaa
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/aaliyaa.official/" className="hover:text-foreground transition-colors">
                    <i className="fab fa-instagram mr-2"></i>
                    Aaliyaa Official
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@aaliyaa.official?_r=1&_t=ZS-93O8eiIeBpi" className="hover:text-foreground transition-colors">
                    <i className="fab fa-tiktok mr-2"></i>
                    @aaliyaa.official
                  </a>
                </li>
              </ul>
            </div> */}
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wide mb-4 text-foreground">Quick Links</h4>
            <div className="flex gap-8">
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>
                  <a href="/shop" className="hover:text-foreground transition-colors">Shop</a>
                </li>
                <li>
                  <a href="/collections" className="hover:text-foreground transition-colors">Collections</a>
                </li>
                <li>
                  <a href="/about" className="hover:text-foreground transition-colors">About</a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                </li>
                <li>
                  <a href="/account" className="hover:text-foreground transition-colors">Shipping</a>
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>
                  <a href="/profile" className="hover:text-foreground transition-colors">Profile</a>
                </li>
                <li>
                  <a href="/policies/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
                </li>
                <li>
                  <a href="/policies/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="/policies/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a>
                </li>
              </ul>
            </div>
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
