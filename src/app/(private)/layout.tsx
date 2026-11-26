import { SiteShell } from "@/components/SiteShell";

/** Pages à jeton secret (devis client, paiement) : même cadre que le site, mais sans aucun pixel publicitaire. */
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell tracking={false}>{children}</SiteShell>;
}
