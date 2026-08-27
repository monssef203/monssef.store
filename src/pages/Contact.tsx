import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { buildWhatsAppLink, CONTACT_CITY, CONTACT_EMAIL, CONTACT_PHONE, STORE_NAME } from "../config/config";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Contactez-nous</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-500">
        Une question sur un produit, votre commande ou une livraison ? Notre équipe vous répond rapidement.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a
            href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, j'ai une question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-scale flex items-center gap-3 rounded-2xl bg-[#25D366] p-5 text-white"
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-white/90">Réponse rapide, du lundi au samedi</p>
            </div>
          </a>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-5">
            <Phone className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Téléphone</p>
              <p className="text-xs text-neutral-500">{CONTACT_PHONE}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-5">
            <Mail className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">E-mail</p>
              <p className="text-xs text-neutral-500">{CONTACT_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-5">
            <MapPin className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Adresse</p>
              <p className="text-xs text-neutral-500">{CONTACT_CITY}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 sm:p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <h2 className="font-display mt-4 text-xl text-[var(--color-ink)]">Message envoyé !</h2>
              <p className="mt-1 max-w-xs text-sm text-neutral-500">Merci de nous avoir contactés, nous reviendrons vers vous très vite.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-[var(--color-gold)] underline underline-offset-4">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Nom *
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <button type="submit" className="tap-scale w-full rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-black">
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
