import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, MessageCircle, ShoppingBag, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "../data/products";
import { formatPrice, buildWhatsAppLink, STORE_NAME } from "../config/config";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductGallery from "../components/ProductGallery";
import Breadcrumbs from "../components/Breadcrumbs";
import StarRating from "../components/StarRating";
import QuantitySelector from "../components/QuantitySelector";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import Reveal from "../components/Reveal";
import { cn } from "../utils/cn";
import { PackageX } from "lucide-react";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    setQuantity(1);
    setTab("description");
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={PackageX}
          title="Produit introuvable"
          description="Ce produit n'existe pas ou a été retiré du catalogue."
          action={
            <Link to="/catalogue" className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-sm font-medium text-white">
              Retour au catalogue
            </Link>
          }
        />
      </div>
    );
  }

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const wishlisted = isWishlisted(product.id);
  const related = getRelatedProducts(product);

  const handleAddToCart = () => addToCart(product.id, quantity);
  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    navigate("/checkout");
  };

  const whatsappMessage = `Bonjour ${STORE_NAME}, je suis intéressé(e) par : ${product.name} - ${formatPrice(product.price)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Catalogue", to: "/catalogue" }, { label: product.name }]} />

      <div className="mt-4 grid grid-cols-1 gap-8 sm:mt-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:pt-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">{product.category} · {product.collection}</p>
          <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-neutral-500">
              {product.rating.toFixed(1)} ({product.reviewCount} avis)
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.inStock ? (
              <span className="font-medium text-emerald-600">✓ En stock — expédié sous 24 à 48h</span>
            ) : (
              <span className="font-medium text-red-500">Actuellement épuisé</span>
            )}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-neutral-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              className="tap-scale flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200"
            >
              <Heart className={cn("h-5 w-5", wishlisted ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-ink)]")} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-ink)] bg-white py-3.5 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              Ajouter au panier
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Acheter maintenant
            </button>
          </div>

          <a
            href={buildWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-scale mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366]/10 py-3 text-sm font-medium text-[#128C4A]"
          >
            <MessageCircle className="h-4 w-4" />
            Demander sur WhatsApp
          </a>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
              <Truck className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
              Livraison partout au Maroc
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
              <RotateCcw className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
              Retour sous 7 jours
            </div>
            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
              Garantie {product.warranty}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14 sm:mt-20">
        <div className="flex gap-6 border-b border-neutral-200">
          {(
            [
              ["description", "Description"],
              ["specs", "Spécifications"],
              ["reviews", `Avis (${product.reviewCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                tab === key ? "text-[var(--color-ink)]" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              {label}
              {tab === key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-gold)]" />}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "description" && (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">{product.description}</p>
          )}

          {tab === "specs" && (
            <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Mouvement", product.movement],
                ["Matière", product.material],
                ["Couleur", product.color],
                ["Diamètre du boîtier", product.diameter],
                ["Bracelet", product.strap],
                ["Étanchéité", product.waterResistance],
                ["Garantie", product.warranty],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-neutral-100 pb-3 text-sm">
                  <dt className="text-neutral-500">{label}</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === "reviews" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-5">
                <span className="font-display text-4xl text-[var(--color-ink)]">{product.rating.toFixed(1)}</span>
                <div>
                  <StarRating rating={product.rating} size="md" />
                  <p className="mt-1 text-xs text-neutral-500">Basé sur {product.reviewCount} avis clients</p>
                </div>
              </div>
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-100 pb-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{review.author}</p>
                    <span className="text-xs text-neutral-400">{new Date(review.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10 sm:mt-16">
          <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
