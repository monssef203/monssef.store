import { PackageCheck, PhoneCall, Undo2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { buildWhatsAppLink, STORE_NAME } from "../config/config";

const STEPS = [
  { icon: PhoneCall, title: "1. Contactez-nous", desc: "Envoyez-nous un message sur WhatsApp avec votre numéro de commande." },
  { icon: Undo2, title: "2. Renvoyez le produit", desc: "Remettez la montre dans son emballage d'origine, non portée." },
  { icon: PackageCheck, title: "3. Remboursement ou échange", desc: "Une fois le produit vérifié, nous procédons à l'échange ou au remboursement." },
];

export default function Returns() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Retours" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Retours &amp; échanges</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Votre satisfaction est notre priorité. Vous disposez de <span className="font-semibold text-[var(--color-ink)]">7 jours</span>{" "}
        après réception de votre commande pour demander un retour ou un échange, à condition que l'article soit dans
        son état d'origine, non porté et avec son emballage complet.
      </p>

      <div className="mt-8 space-y-4">
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

      <div className="mt-8 rounded-2xl bg-[var(--color-sand)] p-6 text-center">
        <p className="text-sm text-neutral-700">Besoin d'aide pour un retour ou un échange ?</p>
        <a
          href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, je souhaite faire un retour/échange.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-scale mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white"
        >
          Contacter le support WhatsApp
        </a>
      </div>
    </div>
  );
}
