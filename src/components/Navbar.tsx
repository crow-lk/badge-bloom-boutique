import logo from "@/assets/logo.jpeg";
import { fallbackProducts, useProducts } from "@/hooks/use-products";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const NAV_HEIGHT = 72;

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
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

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm relative"
      style={{ height: `${NAV_HEIGHT}px` }}
    >
      <div className="container mx-auto flex h-full items-center px-6">
        <div className="flex items-center gap-3.5">
          <img src={logo} alt="Aaliyaa logo" className="h-12 w-12 rounded-full object-cover" />
          <span className="hidden text-sm font-light uppercase tracking-[0.35em] text-foreground sm:inline">
            Aaliyaa
          </span>
        </div>

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
          <a href="#about" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        <div className="ml-auto flex items-center gap-5">
          <button
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link to="/login" className="text-foreground hover:text-primary transition-colors" aria-label="Account">
            <User className="h-5 w-5" />
          </Link>
          <button className="text-foreground hover:text-primary transition-colors" aria-label="Shopping bag">
            <ShoppingBag className="w-5 h-5" />
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
                              {product.priceLabel} • {product.collection_id ?? "Collection"} • {product.category_id ?? "Category"}
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
    </nav>
  );
};

export default Navbar;
