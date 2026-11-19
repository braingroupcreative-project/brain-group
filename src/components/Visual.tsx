import { Icon } from "./Icon";
import type { ServiceKey } from "@/lib/site";
import { SERVICES } from "@/lib/site";
import Image from "next/image";

/** Visuel de réalisation : photo réelle si fournie, sinon vignette de marque (jamais de fausse photo). */
export function Visual({
  service,
  image,
  alt,
  className = "",
  label,
}: {
  service: ServiceKey;
  image?: string;
  alt: string;
  className?: string;
  label?: string;
}) {
  const grad = {
    evenementiel: "from-navy via-navy-800 to-orange",
    imprimerie: "from-orange via-orange-600 to-navy",
    informatique: "from-navy-700 via-navy to-orange",
  }[service];
  if (image)
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={image} alt={alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" loading="lazy" />
      </div>
    );
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${grad} ${className}`} role="img" aria-label={alt}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%)" }} />
      <div className="relative flex flex-col items-center gap-2 text-white/90">
        <Icon name={SERVICES[service].icon} className="h-10 w-10" />
        {label && <span className="font-display text-xs font-bold uppercase tracking-widest">{label}</span>}
      </div>
    </div>
  );
}
