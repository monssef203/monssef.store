import { Truck, MapPin, Clock, CreditCard } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../config/config";

const STEPS = [
  { icon: Clock, title: "Traitement de la commande", desc: "Votre commande est préparée sous 24h ouvrées." },
  { icon: Truck, title: "Expédition", desc: "Le colis est confié à notre partenaire de livraison." },
  { icon: MapPin, title: "Livraison", desc: "Livraison à votre adresse partout au Maroc, sous 24 à 72h." },
  { icon: CreditCard, title: "Paiement", desc: "Vous payez en espèces à la réception (Cash on Delivery)." },
];

export default function Shipping() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Livraison" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Livraison</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        MONSTORE livre partout au Royaume du Maroc. Les frais de livraison sont de{" "}
        <span className="font-semibold text-[var(--color-ink)]">{formatPrice(SHIPPING_COST)}</span> et sont offerts dès{" "}
        <span className="font-semibold text-[var(--color-ink)]">{formatPrice(FREE_SHIPPING_THRESHOLD)}</span> d'achat.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STEPS.map((step) => (
          <div key={step.title} className="flex gap-4 rounded-2xl bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-sand)]">
              <step.icon className="h-5 w-5 text-[var(--color-gold)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">{step.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl text-[var(--color-ink)]">Zones de livraison &amp; délais estimés</h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-600">
          <li className="flex justify-between border-b border-neutral-100 pb-2">
            <span>Casablanca, Rabat, Salé</span>
            <span className="font-medium text-[var(--color-ink)]">24 - 48h</span>
          </li>
          <li className="flex justify-between border-b border-neutral-100 pb-2">
            <span>Marrakech, Fès, Tanger, Agadir</span>
            <span className="font-medium text-[var(--color-ink)]">48 - 72h</span>
          </li>
          <li className="flex justify-between">
            <span>Autres villes &amp; zones rurales</span>
            <span className="font-medium text-[var(--color-ink)]">3 - 5 jours</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
