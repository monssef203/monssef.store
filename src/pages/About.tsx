import { Link } from "react-router-dom";
import { Gem, HandHeart, Leaf } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import Reveal from "../components/Reveal";

const PILLARS = [
  { icon: Gem, title: "Qualité avant tout", desc: "Des matériaux nobles — acier inoxydable, cuir véritable, céramique — sélectionnés avec exigence." },
  { icon: HandHeart, title: "Un service à l'écoute", desc: "Une équipe disponible sur WhatsApp pour vous conseiller avant, pendant et après votre achat." },
  { icon: Leaf, title: "Pensé pour durer", desc: "Des montres conçues pour accompagner chaque moment, année après année." },
];

export default function About() {
  return (
    <div>
      <div className="relative h-64 overflow-hidden sm:h-80">
        <img src="/images/hero/hero-main.jpg" alt="MONSTORE — montres premium" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <h1 className="font-display text-4xl text-white sm:text-5xl">À propos de MONSTORE</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumbs items={[{ label: "À propos" }]} />

        <Reveal>
          <p className="mt-6 text-base leading-relaxed text-neutral-600">
            MONSTORE est une maison marocaine dédiée à l'horlogerie premium. Notre mission est simple : rendre
            accessible une élégance intemporelle, avec des montres qui allient design soigné, matériaux de qualité et
            service client irréprochable — pensées pour le marché marocain.
          </p>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Depuis nos débuts, nous avons à cœur de proposer une expérience d'achat simple et rassurante : paiement à
            la livraison, livraison rapide dans tout le Royaume et un accompagnement humain à chaque étape.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="h-full rounded-2xl bg-white p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-sand)]">
                  <p.icon className="h-5.5 w-5.5 text-[var(--color-gold)]" />
                </div>
                <h3 className="font-display mt-4 text-lg text-[var(--color-ink)]">{p.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 rounded-2xl bg-[var(--color-ink)] p-8 text-center">
            <h2 className="font-display text-2xl text-white">Prêt à trouver votre montre idéale ?</h2>
            <Link
              to="/catalogue"
              className="tap-scale mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
            >
              Voir le catalogue
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
