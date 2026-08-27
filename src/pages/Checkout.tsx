import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Truck, BadgeCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { formatPrice } from "../config/config";
import EmptyState from "../components/EmptyState";
import Breadcrumbs from "../components/Breadcrumbs";
import { cn } from "../utils/cn";
import type { Order } from "../types";

interface FormState {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  notes: string;
}

const INITIAL_FORM: FormState = { fullName: "", phone: "", city: "", address: "", email: "", notes: "" };

const MOROCCAN_PHONE_REGEX = /^(?:\+212|0)[5-7]\d{8}$/;

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 3) errors.fullName = "Veuillez entrer votre nom complet.";
  if (!MOROCCAN_PHONE_REGEX.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Numéro invalide. Exemple : 06 12 34 56 78";
  if (!form.city.trim()) errors.city = "Veuillez indiquer votre ville.";
  if (!form.address.trim() || form.address.trim().length < 6) errors.address = "Veuillez indiquer une adresse complète.";
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Adresse e-mail invalide.";
  return errors;
}

export default function Checkout() {
  const { cartProducts, subtotal, shipping, total, clearCart } = useCart();
  const { saveOrder } = useOrder();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Ajoutez des produits à votre panier avant de passer commande."
          action={
            <Link to="/catalogue" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-white">
              Voir le catalogue
            </Link>
          }
        />
      </div>
    );
  }

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    const order: Order = {
      id: `MS-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      customer: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      },
      items: cartProducts,
      subtotal,
      shipping,
      total,
    };

    window.setTimeout(() => {
      saveOrder(order);
      clearCart();
      navigate("/order-success");
    }, 600);
  };

  const inputClass = (field: keyof FormState) =>
    cn(
      "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40",
      errors[field] ? "border-red-400" : "border-neutral-200 focus:border-[var(--color-gold)]"
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Panier", to: "/cart" }, { label: "Commande" }]} />
      <h1 className="font-display mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl">Finaliser la commande</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="rounded-2xl bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl text-[var(--color-ink)]">Informations de livraison</h2>
            <p className="mt-1 text-xs text-neutral-500">Paiement à la livraison — disponible partout au Maroc.</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Nom complet *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Ex : Yasmine El Amrani"
                  className={inputClass("fullName")}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && <p id="fullName-error" className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Téléphone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="06 12 34 56 78"
                  className={inputClass("phone")}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && <p id="phone-error" className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="city" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Ville *
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="Casablanca"
                  className={inputClass("city")}
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && <p id="city-error" className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Adresse complète *
                </label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="Rue, quartier, numéro..."
                  className={inputClass("address")}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? "address-error" : undefined}
                />
                {errors.address && <p id="address-error" className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  E-mail (optionnel)
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="vous@exemple.com"
                  className={inputClass("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Notes de commande (optionnel)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange("notes")}
                  placeholder="Instructions de livraison, préférences..."
                  className={inputClass("notes")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-sand)] p-4 text-sm text-neutral-700">
            <Truck className="h-5 w-5 shrink-0 text-[var(--color-gold)]" />
            Paiement en espèces à la livraison (Cash on Delivery).
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-4 text-sm font-semibold uppercase tracking-wide text-white hover:bg-black disabled:opacity-60"
          >
            <BadgeCheck className="h-4 w-4" />
            {submitting ? "Traitement en cours..." : "Confirmer la commande"}
          </button>
        </form>

        <div className="h-fit rounded-2xl bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl text-[var(--color-ink)]">Votre commande</h2>
          <ul className="mt-4 space-y-4">
            {cartProducts.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--color-sand)]">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[10px] text-white">
                    {quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-[var(--color-ink)]">{product.name}</p>
                  <p className="text-xs text-neutral-500">{product.category}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[var(--color-ink)]">{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-neutral-100 pt-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Livraison</span>
              <span>{shipping === 0 ? "Gratuite" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-[var(--color-ink)]">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
