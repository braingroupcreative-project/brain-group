"use client";
import { useActionState } from "react";
import { changeOwnPassword } from "../../actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, undefined);
  return (
    <form action={action} className="space-y-3">
      <div><label className="label" htmlFor="cur">Mot de passe actuel</label><input id="cur" name="current" type="password" required autoComplete="current-password" className="input" /></div>
      <div><label className="label" htmlFor="new">Nouveau mot de passe (10 caractères min.)</label><input id="new" name="password" type="password" required minLength={10} autoComplete="new-password" className="input" /></div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">Mot de passe modifié ✔</p>}
      <button className="btn-dark" disabled={pending}>Mettre à jour</button>
    </form>
  );
}
