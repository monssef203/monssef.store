import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { STORE_NAME } from "../config/config";
import { cn } from "../utils/cn";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[var(--color-gold)] px-1 text-[10px] font-semibold leading-none text-white animate-[bump_0.35s_ease]"
    >
      {count}
    </span>
  );
}

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { count } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow duration-300",
        scrolled ? "border-neutral-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)]" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="tap-scale -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] lg:hidden"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>

        <Link to="/" className="font-display select-none text-2xl font-semibold tracking-[0.08em] text-[var(--color-ink)] sm:text-3xl">
          {STORE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium uppercase tracking-wide text-neutral-600 transition-colors hover:text-[var(--color-ink)]",
                  isActive && "text-[var(--color-ink)]"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Rechercher"
            className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-neutral-50"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/wishlist"
            aria-label="Ma liste de favoris"
            className="tap-scale relative hidden h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-neutral-50 sm:flex"
          >
            <Heart className="h-5 w-5" />
            <CountBadge count={count} />
          </Link>

          <Link
            to="/cart"
            aria-label="Mon panier"
            className="tap-scale relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-neutral-50"
          >
            <ShoppingBag className="h-5 w-5" />
            <CountBadge count={totalItems} />
          </Link>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
