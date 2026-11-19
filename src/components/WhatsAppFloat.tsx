"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { SERVICES, SITE, waLink, type ServiceKey } from "@/lib/site";

/** Message prérempli par pôle : le client arrive déjà qualifié dans la conversation. */
const TOPICS: { key: ServiceKey; emoji: string; ask: string }[] = [
  { key: "evenementiel", emoji: "📸", ask: "la couverture d'un événement (photo, vidéo)" },
  { key: "imprimerie", emoji: "🖨️", ask: "un travail d'imprimerie ou de communication visuelle" },
  { key: "informatique", emoji: "💻", ask: "du matériel informatique" },
  { key: "digital", emoji: "🚀", ask: "un projet digital (site, application, automatisation, IA)" },
  { key: "communication", emoji: "📣", ask: "la communication et la visibilité (réseaux sociaux, clip vidéo…)" },
];

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => setOpen(false), [path]);

  const where = path && path !== "/" ? ` (depuis la page ${path})` : "";
  const open_wa = (text: string) => {
    window.open(waLink(text), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div ref={box} className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Choisir un service pour écrire sur WhatsApp"
          className="absolute bottom-16 right-0 w-[min(92vw,22rem)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-navy/10"
        >
          <div className="bg-[#075E54] px-4 py-3 text-white">
            <p className="font-display text-sm font-bold">Brain Group sur WhatsApp</p>
            <p className="text-xs text-white/80">Répondez en un clic : nous répondons dès que possible.</p>
          </div>
          <div className="space-y-3 bg-[#ECE5DD] p-3">
            <p className="max-w-[85%] rounded-xl rounded-tl-none bg-white px-3 py-2 text-sm shadow-sm">
              Bonjour 👋 Que souhaitez-vous ? Choisissez un service :
            </p>
            <ul className="space-y-2">
              {TOPICS.map((t) => (
                <li key={t.key} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      open_wa(`Bonjour Brain Group, je suis intéressé(e) par : ${SERVICES[t.key].label}. Je souhaite des informations sur ${t.ask}.${where}`)
                    }
                    className="flex-1 rounded-xl bg-white px-3 py-2.5 text-left text-sm font-semibold shadow-sm transition hover:bg-orange-50"
                  >
                    <span aria-hidden="true">{t.emoji}</span> {SERVICES[t.key].label}
                  </button>
                  <Link
                    href={`/devis?service=${t.key}`}
                    onClick={() => setOpen(false)}
                    className="grid shrink-0 place-items-center rounded-xl bg-navy px-3 text-xs font-bold text-white hover:bg-navy-800"
                    aria-label={`Demander un devis en ligne : ${SERVICES[t.key].label}`}
                  >
                    Devis
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => open_wa(`Bonjour Brain Group, j'ai une question.${where}`)}
              className="w-full rounded-xl bg-white px-3 py-2.5 text-left text-sm font-semibold shadow-sm transition hover:bg-orange-50"
            >
              💬 Autre question
            </button>
            <p className="text-center text-[11px] text-navy/60">
              « Devis » = formulaire en ligne en 2 minutes{SITE.phone ? ` · ${SITE.phone}` : ""}
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu WhatsApp" : "Écrire à Brain Group sur WhatsApp"}
        className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-display text-sm font-bold text-white shadow-lg transition hover:scale-105"
      >
        <Icon name={open ? "close" : "whatsapp"} className="h-6 w-6" />
        <span className="hidden sm:inline">{open ? "Fermer" : "WhatsApp"}</span>
      </button>
    </div>
  );
}
