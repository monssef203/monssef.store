import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, STORE_NAME } from "../config/config";

export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, j'ai une question sur vos montres.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className="tap-scale fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
      <span className="sr-only">Discuter sur WhatsApp</span>
    </a>
  );
}
