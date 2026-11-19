"use client";
import { useActionState } from "react";
import { createUser } from "../../actions";

export function NewUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);
  return (
    <form action={action} className="space-y-3">
      <div><label className="label" htmlFor="n">Nom</label><input id="n" name="name" required className="input !py-2" /></div>
      <div><label className="label" htmlFor="e">E-mail</label><input id="e" name="email" type="email" required className="input !py-2" /></div>
      <div><label className="label" htmlFor="r">Rôle</label>
        <select id="r" name="role" className="input !py-2" defaultValue="agent"><option value="agent">Agent commercial</option><option value="admin">Administrateur</option></select></div>
      <div><label className="label" htmlFor="p">Mot de passe (10 caractères min.)</label><input id="p" name="password" type="password" required minLength={10} autoComplete="new-password" className="input !py-2" /></div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">Utilisateur créé ✔</p>}
      <button className="btn-dark w-full" disabled={pending}>Créer</button>
    </form>
  );
}
