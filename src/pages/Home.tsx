import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, MessageCircle, Star } from "lucide-react";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { buildWhatsAppLink, STORE_NAME } from "../config/config";

const COLLECTION_CARDS = [
  { name: "Héritage", tagline: "Élégance intemporelle", image: "/images/products/classic-black-steel.jpg" },
  { name: "Abyss", tagline: "Esprit d'aventure", image: "/images/products/diver-blue-steel.jpg" },
  { name: "Aurea", tagline: "Raffinement féminin", image: "/images/products/rose-gold-mesh.jpg" },
  { name: "Onyx", tagline: "Minimalisme urbain", image: "/images/products/matte-black-rubber.jpg" },
];

const VALUES = [
  { icon: Truck, title: "Livraison partout au Maroc", desc: "Expédition rapide vers toutes les villes, paiement à la réception." },
  { icon: ShieldCheck, title: "Garantie 2 ans", desc: "Chaque montre MONSTORE est couverte contre les défauts de fabrication." },
  { icon: RotateCcw, title: "Retours faciles", desc: "7 jours pour changer d'avis, sans complications." },
];

const TESTIMONIALS = [
  { name: "Youssef B.", city: "Casablanca", rating: 5, text: "Qualité exceptionnelle, livraison rapide. Exactement comme sur les photos." },
  { name: "Salma K.", city: "Rabat", rating: 5, text: "Le service client est très réactif sur WhatsApp. Ma montre est magnifique." },
  { name: "Amine T.", city: "Marrakech", rating: 4, text: "Beau produit, bon rapport qualité-prix. Je recommande MONSTORE." },
];

export default function Home() {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden bg-[var(--color-ink)] sm:min-h-[90vh] sm:items-center">
        <img
          src="/images/hero/hero-main.jpg"
          alt="Montre de luxe MONSTORE en gros plan"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-0 sm:pt-0 lg:px-8">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--color-gold-light)]">
              Montres premium — Maroc
            </p>
            <h1 className="font-display mt-4 max-w-xl text-4xl leading-[1.1] text-white sm:text-6xl lg:text-7xl">
              L'art de mesurer le temps, avec élégance
            </h1>
            <p className="mt-5 max-w-md text-sm text-neutral-200 sm:text-base">
              Découvrez des montres à l'allure intemporelle, pensées pour celles et ceux qui exigent le meilleur.
              Livraison partout au Maroc, paiement à la livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalogue"
                className="tap-scale flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] hover:bg-neutral-100"
              >
                Découvrir la collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="tap-scale flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/10"
              >
                Notre histoire
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Nos collections</p>
              <h2 className="font-display mt-2 text-3xl text-[var(--color-ink)] sm:text-4xl">Une pièce pour chaque style</h2>
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {COLLECTION_CARDS.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <Link to={`/catalogue?collection=${encodeURIComponent(c.name)}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display text-xl text-white sm:text-2xl">{c.name}</h3>
                  <p className="text-xs text-neutral-200">{c.tagline}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Best-sellers</p>
                <h2 className="font-display mt-2 text-3xl text-[var(--color-ink)] sm:text-4xl">Les plus demandées</h2>
              </div>
              <Link to="/catalogue" className="hidden items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] sm:flex">
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {bestSellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} priority={i < 2} />
              </Reveal>
            ))}
          </div>
          <Link to="/catalogue" className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--color-ink)] sm:hidden">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Nouveautés</p>
            <h2 className="font-display mt-2 text-3xl text-[var(--color-ink)] sm:text-4xl">Fraîchement arrivées</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {newArrivals.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Brand story */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img src="/images/brand/craftsmanship.jpg" alt="Savoir-faire horloger MONSTORE" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Notre histoire</p>
            <h2 className="font-display mt-2 text-3xl text-[var(--color-ink)] sm:text-4xl">
              Créée au Maroc, pensée pour durer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              MONSTORE est né d'une conviction simple : chacun mérite d'accéder à une montre d'exception, sans
              compromis sur la qualité. Nous sélectionnons des matériaux nobles — acier inoxydable, cuir véritable,
              céramique — et travaillons avec des ateliers rigoureux pour offrir des pièces fiables, élégantes et
              accessibles.
            </p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold)]">
              En savoir plus sur MONSTORE
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why MONSTORE */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Pourquoi MONSTORE</p>
          <h2 className="font-display mt-2 text-center text-3xl text-[var(--color-ink)] sm:text-4xl">
            Une expérience d'achat sereine
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="rounded-2xl bg-white p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-sand)]">
                  <v.icon className="h-5.5 w-5.5 text-[var(--color-gold)]" />
                </div>
                <h3 className="font-display mt-4 text-lg text-[var(--color-ink)]">{v.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Avis clients</p>
            <h2 className="font-display mt-2 text-3xl text-[var(--color-ink)] sm:text-4xl">Ils nous font confiance</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="h-full rounded-2xl bg-[var(--color-cream)] p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < t.rating ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "fill-neutral-200 text-neutral-200"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">“{t.text}”</p>
                  <p className="mt-4 text-sm font-medium text-[var(--color-ink)]">
                    {t.name} <span className="font-normal text-neutral-400">— {t.city}</span>
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-[var(--color-ink)] px-6 py-12 text-center sm:px-12">
            <h2 className="font-display max-w-lg text-3xl text-white sm:text-4xl">
              Une question avant d'acheter ?
            </h2>
            <p className="max-w-md text-sm text-neutral-300">
              Notre équipe est disponible sur WhatsApp pour vous conseiller et confirmer votre commande.
            </p>
            <a
              href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, j'ai une question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-scale flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" />
              Discuter sur WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
