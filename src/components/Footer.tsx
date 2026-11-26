import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { CookieSettings } from "./CookieSettings";
import { SITE, SERVICES, waLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed">{SITE.tagline}. Un partenaire unique pour vos événements, vos supports de communication et votre équipement.</p>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="space-y-2 text-sm">
            {Object.values(SERVICES).map((s) => (
              <li key={s.key}><Link className="hover:text-orange" href={s.href}>{s.label}</Link></li>
            ))}
            <li><Link className="hover:text-orange" href="/realisations">Réalisations</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Informations</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-orange" href="/a-propos">À propos</Link></li>
            <li><Link className="hover:text-orange" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-orange" href="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="hover:text-orange" href="/confidentialite">Politique de confidentialité</Link></li>
            <li><Link className="hover:text-orange" href="/conditions">Conditions de vente et de paiement</Link></li>
            <CookieSettings />
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Nous joindre</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-orange" /><a href={`mailto:${SITE.email}`} className="break-all hover:text-orange">{SITE.email}</a></li>
            {SITE.phone && <li className="flex gap-2"><Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-orange" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-orange">{SITE.phone}</a></li>}
            {SITE.whatsapp && <li className="flex gap-2"><Icon name="whatsapp" className="mt-0.5 h-4 w-4 shrink-0 text-orange" /><a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-orange">WhatsApp Business</a></li>}
            <li className="flex gap-2"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-orange" />{SITE.address}</li>
            {SITE.facebook && <li><a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-orange">Facebook</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Brain Group. Tous droits réservés.
      </div>
    </footer>
  );
}
