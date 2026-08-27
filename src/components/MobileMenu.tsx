import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { X, ChevronRight, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, STORE_NAME } from "../config/config";
import { cn } from "../utils/cn";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "À propos" },
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Livraison" },
  { to: "/returns", label: "Retours" },
  { to: "/contact", label: "Contact" },
];

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/50"
          />
          <motion.div
            initial={{ x: "-100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0.5 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className="fixed inset-y-0 left-0 z-[90] flex w-[85%] max-w-sm flex-col bg-white shadow-2xl safe-bottom"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5">
              <span className="font-display text-2xl tracking-wide text-[var(--color-ink)]">{STORE_NAME}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                className="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between rounded-xl px-3 py-3.5 text-base text-[var(--color-ink)] transition-colors",
                          isActive ? "bg-[var(--color-sand)] font-medium" : "hover:bg-neutral-50"
                        )
                      }
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 text-neutral-300" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-neutral-100 p-5">
              <a
                href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, j'ai une question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-scale flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-medium text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Discuter sur WhatsApp
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
