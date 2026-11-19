import { Icon } from "./Icon";
import { SITE, waLink } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink("Bonjour Brain Group, je souhaite un renseignement.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à Brain Group sur WhatsApp"
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-display text-sm font-bold text-white shadow-lg transition hover:scale-105 sm:bottom-6 sm:right-6"
      data-has-number={SITE.whatsapp ? "1" : "0"}
    >
      <Icon name="whatsapp" className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
