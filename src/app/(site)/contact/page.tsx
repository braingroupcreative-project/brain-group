import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { SITE, waLink } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Brain Group par e-mail, téléphone ou WhatsApp. Réponse rapide à toutes vos demandes.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const items = [
    { icon: "mail", label: "E-mail", value: SITE.email, href: `mailto:${SITE.email}` },
    SITE.phone && { icon: "phone", label: "Téléphone", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
    SITE.whatsapp && { icon: "whatsapp", label: "WhatsApp Business", value: "Écrire sur WhatsApp", href: waLink("Bonjour Brain Group,") },
    { icon: "pin", label: "Localisation", value: SITE.address },
    SITE.facebook && { icon: "users", label: "Facebook", value: "Notre page Facebook", href: SITE.facebook },
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[];

  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-x">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2 text-4xl font-extrabold !text-white">Parlons de votre projet</h1>
          <p className="mt-3 max-w-2xl text-white/80">Pour un devis précis, utilisez plutôt notre formulaire de demande de devis. Pour toute autre question, écrivez-nous.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.label} className="card flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700"><Icon name={i.icon} /></span>
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold uppercase tracking-wider text-navy/50">{i.label}</p>
                  {i.href ? (
                    <a href={i.href} className="break-words font-semibold hover:text-orange-700" {...(i.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{i.value}</a>
                  ) : (
                    <p className="font-semibold">{i.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl">Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
