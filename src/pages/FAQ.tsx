import Breadcrumbs from "../components/Breadcrumbs";
import Accordion from "../components/Accordion";

const FAQ_ITEMS = [
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Nous livrons partout au Maroc en 24 à 72 heures selon votre ville. Casablanca, Rabat et Marrakech sont généralement livrées sous 24 à 48h.",
  },
  {
    question: "Comment fonctionne le paiement à la livraison ?",
    answer:
      "Vous payez en espèces directement au livreur au moment de la réception de votre colis. Aucun paiement en ligne n'est requis.",
  },
  {
    question: "Puis-je retourner ou échanger ma montre ?",
    answer:
      "Oui, vous disposez de 7 jours après réception pour demander un retour ou un échange, à condition que le produit soit dans son état d'origine.",
  },
  {
    question: "Les montres sont-elles garanties ?",
    answer: "Toutes nos montres bénéficient d'une garantie de 2 ans contre les défauts de fabrication.",
  },
  {
    question: "Comment choisir la bonne taille de bracelet ?",
    answer:
      "Chaque fiche produit indique le diamètre du boîtier et le type de bracelet. La plupart de nos bracelets sont ajustables. Contactez-nous sur WhatsApp pour un conseil personnalisé.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Après validation de votre commande, notre équipe vous contacte par téléphone ou WhatsApp pour confirmer les détails et vous tenir informé du statut de livraison.",
  },
];

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Questions fréquentes</h1>
      <p className="mt-2 text-sm text-neutral-500">Tout ce que vous devez savoir avant de commander chez MONSTORE.</p>
      <div className="mt-8">
        <Accordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
