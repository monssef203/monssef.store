import { Link } from "react-router-dom";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../config/config";
import EmptyState from "../components/EmptyState";
import Breadcrumbs from "../components/Breadcrumbs";
import Reveal from "../components/Reveal";

export default function Wishlist() {
  const { products, remove } = useWishlist();
  const { addToCart } = useCart();

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <EmptyState
          icon={Heart}
          title="Votre liste de favoris est vide"
          description="Enregistrez vos montres préférées pour les retrouver facilement plus tard."
          action={
            <Link to="/catalogue" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-white">
              Découvrir le catalogue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Favoris" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Ma liste de favoris</h1>
      <p className="mt-1 text-sm text-neutral-500">{products.length} produit(s) enregistré(s)</p>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 50}>
            <div className="group">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--color-sand)]">
                <Link to={`/product/${product.slug}`}>
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 sm:group-hover:scale-105" />
                </Link>
                <button
                  onClick={() => remove(product.id)}
                  aria-label={`Retirer ${product.name} des favoris`}
                  className="tap-scale absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm sm:right-3 sm:top-3"
                >
                  <X className="h-4 w-4 text-[var(--color-ink)]" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">{product.category}</p>
                <Link to={`/product/${product.slug}`} className="font-display line-clamp-1 block text-base text-[var(--color-ink)]">
                  {product.name}
                </Link>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatPrice(product.price)}</p>
              </div>
              <button
                onClick={() => addToCart(product.id, 1)}
                disabled={!product.inStock}
                className="tap-scale mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-2.5 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-40"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {product.inStock ? "Ajouter au panier" : "Épuisé"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
