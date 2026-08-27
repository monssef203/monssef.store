import Breadcrumbs from "../components/Breadcrumbs";
import { CONTACT_EMAIL, STORE_NAME } from "../config/config";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Confidentialité" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Politique de confidentialité</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-neutral-600">
        <p>
          Chez {STORE_NAME}, la protection de vos données personnelles est une priorité. Cette page explique quelles
          informations nous collectons et comment elles sont utilisées.
        </p>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Informations collectées</h2>
          <p className="mt-2">
            Lors d'une commande, nous collectons votre nom, numéro de téléphone, adresse de livraison et,
            optionnellement, votre e-mail, uniquement dans le but de traiter et livrer votre commande.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Utilisation des données</h2>
          <p className="mt-2">
            Vos informations sont utilisées exclusivement pour la gestion de votre commande, la communication liée à
            la livraison et l'amélioration de notre service client. Elles ne sont jamais vendues à des tiers.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Cookies &amp; stockage local</h2>
          <p className="mt-2">
            Notre site utilise le stockage local de votre navigateur pour mémoriser le contenu de votre panier et de
            votre liste de favoris, afin d'améliorer votre expérience de navigation.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Vos droits</h2>
          <p className="mt-2">
            Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles en
            nous contactant à l'adresse {CONTACT_EMAIL}.
          </p>
        </div>
      </div>
    </div>
  );
}
