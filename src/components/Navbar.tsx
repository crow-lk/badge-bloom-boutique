import logo from "@/assets/aaliyaa_logo.png";
import { fallbackProducts, getProductDisplayPrice, useProducts } from "@/hooks/use-products";
import { clearStoredAuth, getStoredToken, getStoredUser, logout, type AuthUser } from "@/lib/auth";
import { LogOut, Menu, Search, Settings, ShoppingBag, User, X } from "lucide-react";
import { formatCartCurrency, useCart } from "@/hooks/use-cart";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NAV_HEIGHT = 72;

const Navbar = () => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading } = useProducts();
  const products = useMemo(() => {
    if (data?.length) return data;
    if (!isLoading) return fallbackProducts;
    return [];
  }, [data, isLoading]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(term);
        const collectionMatch = product.collection_id?.toString().toLowerCase().includes(term);
        const categoryMatch = product.category_id?.toString().toLowerCase().includes(term);
        return nameMatch || collectionMatch || categoryMatch;
      })
      .slice(0, 6);
  }, [products, query]);

  const { data: cart, isFetching: isCartFetching } = useCart();
  const cartItems = cart?.items ?? [];
  const cartItemCount = cart?.itemCount ?? 0;
  const previewItems = cartItems.slice(0, 3);
  const hasMoreItems = cartItemCount > previewItems.length;
  const cartTotalLabel = formatCartCurrency(cart?.total, cart?.currency);

  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSearch(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      setAuthUser(user);
    }
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Even if the API call fails, clear local state to avoid trapping users.
    } finally {
      clearStoredAuth();
      setAuthUser(null);
      toast.success("Signed out");
      navigate("/login");
      setIsLoggingOut(false);
      setAccountOpen(false);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm relative"
      style={{ height: `${NAV_HEIGHT}px` }}
    >
      <div className="container mx-auto flex h-full items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3.5 text-foreground hover:text-primary transition-colors">
          <img src={logo} alt="Aaliyaa logo" className="h-[72px] w-[72px] object-contain sm:h-[64px] sm:w-[64px]" />
          <span className="hidden text-sm font-light uppercase tracking-[0.35em] sm:inline">Aaliyaa</span>
        </Link>

        <div className="flex-1 hidden items-center justify-center gap-8 md:flex">
          <a href="/shop" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            Shop
          </a>
          <a href="/products/all" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            Products
          </a>
          <a href="/collections" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            Collections
          </a>
          <a href="/about" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="/contact" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          <button
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <div
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button>
            <div
              className={`absolute right-0 top-full w-56 rounded-xl border border-border bg-card/95 p-3 shadow-xl transition-all duration-200 ${
                accountOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              {authUser ? (
                <>
                  <div className="mb-3 space-y-0.5 px-2">
                    <p className="text-sm font-medium">{authUser.name ?? "Account"}</p>
                    <p className="text-xs text-muted-foreground truncate">{authUser.email ?? "Signed in"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="px-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Profile</p>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-muted/60"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Manage profile
                    </Link>
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="px-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Shipping</p>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-muted/60"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Manage shipping
                    </Link>
                  </div>
                  <button
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-destructive transition hover:bg-muted/60 disabled:opacity-50"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className={isLoggingOut ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="px-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Account</p>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-muted/60"
                    onClick={() => setAccountOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-muted/60"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div
            className="relative"
            onMouseEnter={() => setCartPreviewOpen(true)}
            onMouseLeave={() => setCartPreviewOpen(false)}
          >
            <Link
              to="/cart"
              aria-label="Open shopping bag"
              className="group relative flex items-center justify-center rounded-full p-1 text-foreground transition-colors hover:text-primary"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-lg">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <div
              className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-card/95 p-4 text-sm text-foreground shadow-xl transition-all duration-200 ${
                cartPreviewOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <span>Bag summary</span>
                <span>{cartTotalLabel}</span>
              </div>
              <div className="mt-3 space-y-3">
                {isCartFetching ? (
                  <p className="text-sm text-muted-foreground">Updating bag preview…</p>
                ) : previewItems.length ? (
                  previewItems.map((item) => (
                    <div key={`${item.id}`} className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      {item.price != null && (
                        <p className="text-xs text-muted-foreground">
                          {formatCartCurrency(item.price, cart?.currency ?? "LKR")}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Your bag is empty.</p>
                )}
              </div>
              {hasMoreItems && (
                <p className="mt-3 text-xs text-muted-foreground">
                  +{cartItemCount - previewItems.length} more item
                  {cartItemCount - previewItems.length === 1 ? "" : "s"} in your bag.
                </p>
              )}
            </div>
          </div>
          <button
            className="text-foreground hover:text-primary transition-colors md:hidden"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 right-0 top-0 z-50 transition-all duration-300 ${
          showSearch ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="border border-border bg-card/95 shadow-xl">
          <div
            className="mx-auto w-full max-w-7xl px-6 sm:px-8"
            style={{ height: `${NAV_HEIGHT}px` }}
          >
            <div className="flex h-full items-center gap-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories, collections..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close search"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {query.trim().length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto border-t border-border bg-card/98">
              <div className="mx-auto w-full max-w-7xl px-6 py-3 sm:px-8">
                {isLoading && !products.length ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">Loading results…</p>
                ) : filteredProducts.length ? (
                  <ul className="space-y-2">
                    {filteredProducts.map((product) => (
                      <li key={product.slug}>
                        <Link
                          to={`/products/${product.slug}`}
                          onClick={() => setShowSearch(false)}
                          className="flex items-center gap-3 rounded-md border border-transparent px-2 py-2 transition hover:border-border hover:bg-muted/60"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getProductDisplayPrice(product)} • {product.collection_id ?? "Collection"} • {product.category_id ?? "Category"}
                            </p>
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {product.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-2 py-3 text-sm text-muted-foreground">No matches found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute left-0 right-0 top-full z-40 border-b border-border bg-card/95 shadow-lg transition-all duration-200 ${
          mobileMenuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="container mx-auto px-6 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Navigate</span>
            <button
              className="text-muted-foreground hover:text-foreground transition"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/shop" className="rounded-md px-2 py-2 hover:bg-muted/60" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </a>
            <a
              href="/products/all"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </a>
            <a
              href="/collections"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </a>
            <a
              href="/about"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <a
              href="/account"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shipping
            </a>
            <a
              href="/profile"
              className="rounded-md px-2 py-2 hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </a>
            <Link
              to={authUser ? "/account" : "/login"}
              className="rounded-md px-2 py-2 text-left hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(false)}
            >
              {authUser ? "Manage account" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
