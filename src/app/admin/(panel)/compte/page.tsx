import { requireUser } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Mon compte", robots: { index: false } };

export default async function Account() {
  const u = await requireUser();
  return (
    <div className="max-w-lg space-y-6">
      <div><h1 className="text-2xl">Mon compte</h1><p className="text-sm text-navy/60">{u.name} · {u.email} · {u.role === "admin" ? "Administrateur" : "Agent commercial"}</p></div>
      <section className="card p-5"><h2 className="mb-3 text-base">Changer mon mot de passe</h2><PasswordForm /></section>
    </div>
  );
}
