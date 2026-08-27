import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "../config/config";
import EmptyState from "../components/EmptyState";
import Breadcrumbs from "../components/Breadcrumbs";

export default function Cart() {
  const { cartProducts, updateQuantity, removeFromCart, subtotal, shipping, total } = useCart();

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Découvrez notre collection de montres premium et trouvez la pièce qui vous ressemble."
          action={
            <Link to="/catalogue" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-white">
              Découvrir le catalogue
            </Link>
          }
        />
      </div>
    );
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Panier" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Mon panier</h1>

      {remainingForFreeShipping > 0 ? (
        <p className="mt-3 rounded-xl bg-[var(--color-sand)] px-4 py-3 text-sm text-neutral-700">
          Ajoutez <span className="font-semibold">{formatPrice(remainingForFreeShipping)}</span> pour bénéficier de la
          livraison gratuite.
        </p>
      ) : (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          🎉 Vous bénéficiez de la livraison gratuite !
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-neutral-200">
          {cartProducts.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 py-5 sm:gap-6">
              <Link to={`/product/${product.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-sand)] sm:h-32 sm:w-28">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400">{product.category}</p>
                    <Link to={`/product/${product.slug}`} className="font-display line-clamp-1 text-base text-[var(--color-ink)] sm:text-lg">
                      {product.name}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Retirer ${product.name} du panier`}
                    className="tap-scale shrink-0 rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-neutral-200">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Diminuer la quantité"
                      className="tap-scale flex h-8 w-8 items-center justify-center text-[var(--color-ink)]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Augmenter la quantité"
                      className="tap-scale flex h-8 w-8 items-center justify-center text-[var(--color-ink)]"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-ink)] sm:text-base">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl text-[var(--color-ink)]">Résumé de la commande</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Livraison</span>
              <span>{shipping === 0 ? "Gratuite" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold text-[var(--color-ink)]">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="tap-scale mt-5 flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-black"
          >
            Passer commande
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/catalogue"
            className="mt-3 flex items-center justify-center text-sm font-medium text-neutral-500 hover:text-[var(--color-ink)]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
