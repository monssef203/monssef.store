import Breadcrumbs from "../components/Breadcrumbs";
import { STORE_NAME } from "../config/config";

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Conditions générales" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Conditions générales de vente</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-neutral-600">
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">1. Objet</h2>
          <p className="mt-2">
            Les présentes conditions générales encadrent les ventes réalisées sur le site {STORE_NAME} auprès de
            clients situés au Maroc.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">2. Commande</h2>
          <p className="mt-2">
            Toute commande passée sur le site implique l'acceptation pleine et entière des présentes conditions
            générales de vente.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">3. Prix &amp; paiement</h2>
          <p className="mt-2">
            Les prix sont indiqués en dirhams marocains (DH), toutes taxes comprises. Le paiement s'effectue en
            espèces à la livraison (Cash on Delivery).
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">4. Livraison</h2>
          <p className="mt-2">
            Les délais de livraison sont communiqués à titre indicatif et peuvent varier selon la ville de
            destination. Voir notre page Livraison pour plus de détails.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">5. Retours &amp; échanges</h2>
          <p className="mt-2">
            Conformément à notre politique de retour, vous disposez de 7 jours après réception pour demander un
            retour ou un échange.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-[var(--color-ink)]">6. Garantie</h2>
          <p className="mt-2">Toutes nos montres bénéficient d'une garantie de 2 ans contre les défauts de fabrication.</p>
        </div>
      </div>
    </div>
  );
}
