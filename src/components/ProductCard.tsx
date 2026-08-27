import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../types";
import { formatPrice } from "../config/config";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { cn } from "../utils/cn";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product.id, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--color-sand)]">
        <img
          src={product.images[0]}
          alt={`${product.name} - ${product.category}`}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out sm:group-hover:scale-[1.06]"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5 sm:left-3 sm:top-3">
          {discount > 0 && (
            <span className="rounded-full bg-[var(--color-ink)] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:px-2.5 sm:text-xs">
              -{discount}%
            </span>
          )}
          {product.isNew && discount === 0 && (
            <span className="rounded-full bg-[var(--color-gold)] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:px-2.5 sm:text-xs">
              Nouveau
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold tracking-wide text-[var(--color-ink)] sm:px-2.5 sm:text-xs">
              Épuisé
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={wishlisted}
          className="tap-scale absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur transition-colors hover:bg-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-200 sm:h-4.5 sm:w-4.5",
              wishlisted ? "scale-110 fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-ink)]"
            )}
          />
        </button>

        {/* Mobile compact add-to-cart button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          aria-label="Ajouter au panier"
          className="tap-scale absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-sm backdrop-blur transition-colors hover:bg-[var(--color-ink)] hover:text-white disabled:opacity-40 sm:hidden"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>

        {/* Desktop hover add-to-cart bar */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full opacity-0 transition-all duration-300 ease-out sm:flex sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full items-center justify-center gap-2 bg-[var(--color-ink)]/95 py-3 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur transition-colors hover:bg-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.inStock ? "Ajouter au panier" : "Épuisé"}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 sm:text-[11px]">
          {product.category}
        </p>
        <h3 className="font-display line-clamp-2 text-base font-medium leading-snug text-[var(--color-ink)] sm:text-lg">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-semibold text-[var(--color-ink)] sm:text-base">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
