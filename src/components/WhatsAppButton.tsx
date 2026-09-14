import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, STORE_NAME } from "../config/config";

interface WhatsAppButtonProps {
  hidden?: boolean;
}

export default function WhatsAppButton({ hidden = false }: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppLink(`Bonjour ${STORE_NAME}, j'ai une question sur vos montres.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className={`tap-scale fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-all duration-200 md:bottom-6 md:h-12 md:w-12 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <MessageCircle className="h-6 w-6 md:h-5 md:w-5" fill="white" strokeWidth={0} />
      <span className="sr-only">Discuter sur WhatsApp</span>
    </a>
  );
}
