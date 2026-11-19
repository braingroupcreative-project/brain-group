import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = [
    { href: "/admin", label: "Tableau de bord", icon: "grid" },
    { href: "/admin/demandes", label: "Demandes", icon: "list" },
    { href: "/admin/commandes", label: "Commandes & paiements", icon: "doc" },
    ...(user.role === "admin" ? [{ href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users" }] : []),
    { href: "/admin/compte", label: "Mon compte", icon: "shield" },
  ];
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <aside className="bg-navy text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin"><Logo light /></Link>
          <form action={logout} className="lg:hidden"><button className="text-sm text-white/70 hover:text-white">Déconnexion</button></form>
        </div>
        <AdminNav items={nav} />
        <div className="hidden px-5 pb-5 pt-8 text-sm lg:absolute lg:bottom-0 lg:block lg:w-64">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-white/60">{user.role === "admin" ? "Administrateur" : "Agent commercial"}</p>
          <form action={logout}><button className="mt-3 flex items-center gap-2 text-white/70 hover:text-orange"><Icon name="logout" className="h-4 w-4" /> Déconnexion</button></form>
          <Link href="/" target="_blank" className="mt-3 block text-xs text-white/50 hover:text-white">Voir le site ↗</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
