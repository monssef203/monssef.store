// Central configuration for MONSTORE
// Keep all store-wide constants here so they are easy to change
// and easy to wire up to a real backend later.

export const STORE_NAME = "MONSTORE";

export const WHATSAPP_NUMBER = "212600000000"; // single source of truth (international format, no +)

export const CURRENCY = "DH";

export const SHIPPING_COST = 30; // flat rate shipping in DH
export const FREE_SHIPPING_THRESHOLD = 1500; // orders above this ship free

export const CONTACT_EMAIL = "contact@monstore.ma";
export const CONTACT_PHONE = "+212 6 00 00 00 00";
export const CONTACT_CITY = "Casablanca, Maroc";

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} ${CURRENCY}`;
}
