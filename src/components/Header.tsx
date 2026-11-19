"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "./Icon";

const SERVICES = [
  { href: "/services/evenementiel", label: "Couverture événementielle" },
  { href: "/services/imprimerie", label: "Imprimerie & communication" },
  { href: "/services/informatique", label: "Matériel informatique" },
  { href: "/services/digital", label: "Solutions digitales & IA" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const path = usePathname();
  const link = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition hover:text-orange ${path === href ? "text-orange" : "text-white"}`;

  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-orange focus:px-3 focus:py-2 focus:text-navy">
        Aller au contenu
      </a>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="Brain Group — accueil" onClick={() => setOpen(false)}>
          <Logo light />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          <Link href="/" className={link("/")}>Accueil</Link>
          <div className="relative" onMouseEnter={() => setSub(true)} onMouseLeave={() => setSub(false)}>
            <button
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-white hover:text-orange"
              aria-expanded={sub}
              aria-haspopup="true"
              onClick={() => setSub(!sub)}
              onFocus={() => setSub(true)}
            >
              Services <Icon name="chevron" className="h-4 w-4" />
            </button>
            {sub && (
              <div className="absolute left-0 top-full w-72 pt-2" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setSub(false)}>
                <div className="overflow-hidden rounded-xl bg-white p-2 shadow-card ring-1 ring-navy/10">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href} onClick={() => setSub(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-orange-50">
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/realisations" className={link("/realisations")}>Réalisations</Link>
          <Link href="/a-propos" className={link("/a-propos")}>À propos</Link>
          <Link href="/contact" className={link("/contact")}>Contact</Link>
          <Link href="/devis" className="btn-primary ml-3 !py-2.5">Demander un devis</Link>
        </nav>

        <button className="grid h-11 w-11 place-items-center rounded-lg text-white lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-navy pb-5 lg:hidden" aria-label="Navigation mobile">
          <div className="container-x flex flex-col py-2">
            {[["/", "Accueil"], ...SERVICES.map((s) => [s.href, s.label]), ["/realisations", "Réalisations"], ["/a-propos", "À propos"], ["/contact", "Contact"]].map(([h, l]) => (
              <Link key={h} href={h} onClick={() => setOpen(false)} className={`border-b border-white/10 py-3.5 text-base font-semibold ${h.startsWith("/services") ? "pl-4 text-white/80" : "text-white"}`}>
                {l}
              </Link>
            ))}
            <Link href="/devis" onClick={() => setOpen(false)} className="btn-primary mt-4">Demander un devis</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
