import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { STORE_NAME, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_CITY } from "../config/config";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14V9.5c0-.3.2-.5.5-.5Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Boutique",
    links: [
      { to: "/catalogue", label: "Catalogue" },
      { to: "/catalogue?collection=Héritage", label: "Collection Héritage" },
      { to: "/catalogue?category=Femme", label: "Montres Femme" },
      { to: "/wishlist", label: "Ma liste de favoris" },
    ],
  },
  {
    title: "Aide",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/shipping", label: "Livraison" },
      { to: "/returns", label: "Retours & échanges" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "À propos",
    links: [
      { to: "/about", label: "Notre histoire" },
      { to: "/privacy", label: "Confidentialité" },
      { to: "/terms", label: "Conditions générales" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-[var(--color-ink)] text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="font-display text-3xl tracking-[0.08em] text-white">
              {STORE_NAME}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Montres premium pensées pour durer. Livraison partout au Maroc, paiement à la livraison.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="tap-scale flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="tap-scale flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-neutral-400 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 border-t border-neutral-800 pt-8 text-sm text-neutral-400 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
            {CONTACT_CITY}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
            {CONTACT_PHONE}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
            {CONTACT_EMAIL}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {STORE_NAME}. Tous droits réservés.</p>
          <p>Fait avec soin pour le Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
