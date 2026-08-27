import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, MessageCircle, Truck, Package } from "lucide-react";
import { useOrder } from "../context/OrderContext";
import { formatPrice, buildWhatsAppLink, STORE_NAME } from "../config/config";

export default function OrderSuccess() {
  const { lastOrder } = useOrder();

  if (!lastOrder) return <Navigate to="/" replace />;

  const message = `Bonjour ${STORE_NAME}, je viens de passer la commande ${lastOrder.id}. Pouvez-vous me confirmer les détails de livraison ?`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-500" />
        </div>
        <h1 className="font-display mt-6 text-3xl text-[var(--color-ink)] sm:text-4xl">Commande confirmée !</h1>
        <p className="mt-2 max-w-md text-sm text-neutral-500">
          Merci {lastOrder.customer.fullName.split(" ")[0]}, votre commande a bien été enregistrée. Notre équipe vous
          contactera très prochainement pour confirmer la livraison.
        </p>
        <p className="mt-4 rounded-full bg-[var(--color-sand)] px-4 py-2 text-sm font-medium text-[var(--color-ink)]">
          N° de commande : {lastOrder.id}
        </p>
      </div>

      <div className="mt-10 rounded-2xl bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl text-[var(--color-ink)]">Récapitulatif</h2>
        <ul className="mt-4 divide-y divide-neutral-100">
          {lastOrder.items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-3 py-3">
              <img src={product.images[0]} alt={product.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-[var(--color-ink)]">{product.name}</p>
                <p className="text-xs text-neutral-500">Qté {quantity}</p>
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink)]">{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Sous-total</span>
            <span>{formatPrice(lastOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Livraison</span>
            <span>{lastOrder.shipping === 0 ? "Gratuite" : formatPrice(lastOrder.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-[var(--color-ink)]">
            <span>Total</span>
            <span>{formatPrice(lastOrder.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
            <Package className="h-4 w-4 text-[var(--color-gold)]" />
            Livraison à
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {lastOrder.customer.fullName}
            <br />
            {lastOrder.customer.address}
            <br />
            {lastOrder.customer.city}
            <br />
            {lastOrder.customer.phone}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
            <Truck className="h-4 w-4 text-[var(--color-gold)]" />
            Mode de paiement
          </div>
          <p className="mt-2 text-sm text-neutral-600">Paiement en espèces à la livraison (Cash on Delivery).</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={buildWhatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-medium text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Contacter le support WhatsApp
        </a>
        <Link
          to="/catalogue"
          className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-ink)] py-3.5 text-sm font-medium text-[var(--color-ink)]"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
