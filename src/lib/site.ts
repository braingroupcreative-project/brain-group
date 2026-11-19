export const SITE = {
  name: "Brain Group",
  tagline: "Événementiel, imprimerie, informatique, digital & communication",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.TEAM_EMAIL || "braingroupcreative@gmail.com",
  phone: process.env.NEXT_PUBLIC_PHONE || "",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  address: process.env.NEXT_PUBLIC_ADDRESS || "Côte d'Ivoire",
};

export function waLink(text?: string, number: string = SITE.whatsapp) {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return number ? `https://wa.me/${number}${q}` : `https://wa.me/${q}`;
}

export type ServiceKey = "evenementiel" | "imprimerie" | "informatique" | "digital" | "communication";

export const SERVICES: Record<
  ServiceKey,
  { key: ServiceKey; label: string; short: string; href: string; icon: string; blurb: string }
> = {
  evenementiel: {
    key: "evenementiel",
    label: "Couverture événementielle",
    short: "Événementiel",
    href: "/services/evenementiel",
    icon: "camera",
    blurb: "Mariages, baptêmes, anniversaires, dots, cérémonies et événements professionnels.",
  },
  imprimerie: {
    key: "imprimerie",
    label: "Imprimerie & communication visuelle",
    short: "Imprimerie",
    href: "/services/imprimerie",
    icon: "printer",
    blurb: "T-shirts, polos, goodies, kakémonos, stands PVC, cartes de visite, flyers, affiches.",
  },
  informatique: {
    key: "informatique",
    label: "Matériel informatique",
    short: "Informatique",
    href: "/services/informatique",
    icon: "laptop",
    blurb: "Ordinateurs, téléphones, accessoires et périphériques sur demande de devis.",
  },
  digital: {
    key: "digital",
    label: "Solutions digitales & IA",
    short: "Digital & IA",
    href: "/services/digital",
    icon: "code",
    blurb: "Sites web, e-commerce, applications web et mobiles, e-banking, automatisation et agents IA.",
  },
  communication: {
    key: "communication",
    label: "Communication & visibilité",
    short: "Communication",
    href: "/services/communication",
    icon: "megaphone",
    blurb: "Réseaux sociaux, clips vidéo, publicité en ligne et image de marque, pour les entreprises et les personnalités.",
  },
};

export const STATUS_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle demande",
  en_traitement: "En traitement",
  devis_envoye: "Devis envoyé",
  en_attente_validation: "En attente de validation",
  devis_accepte: "Devis accepté",
  devis_refuse: "Devis refusé",
  acompte_attente: "Acompte en attente",
  commande_confirmee: "Commande confirmée",
  en_production: "En production",
  terminee: "Terminée / livrée",
  annulee: "Annulée",
};

export const STATUS_TONE: Record<string, string> = {
  nouvelle: "bg-orange-50 text-orange-700 ring-orange-200",
  en_traitement: "bg-blue-50 text-blue-700 ring-blue-200",
  devis_envoye: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  en_attente_validation: "bg-amber-50 text-amber-700 ring-amber-200",
  devis_accepte: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  devis_refuse: "bg-rose-50 text-rose-700 ring-rose-200",
  acompte_attente: "bg-amber-50 text-amber-700 ring-amber-200",
  commande_confirmee: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  en_production: "bg-sky-50 text-sky-700 ring-sky-200",
  terminee: "bg-green-50 text-green-700 ring-green-200",
  annulee: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export const REQUEST_STATUSES = Object.keys(STATUS_LABELS);
export const HOURS_72 = 72 * 3600 * 1000;
