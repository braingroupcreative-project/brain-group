"use client";
import { useActionState } from "react";
import { replyToClient } from "../../../actions";

export function ReplyForm({ id, ref_, name }: { id: string; ref_: string; name: string }) {
  const [state, action, pending] = useActionState(replyToClient.bind(null, id), undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="subject">Objet</label>
        <input id="subject" name="subject" required maxLength={150} defaultValue={`Brain Group — Votre demande ${ref_}`} className="input !py-2 text-sm" />
      </div>
      <div>
        <label className="label" htmlFor="body">Message à {name}</label>
        <textarea id="body" name="body" required rows={5} maxLength={5000} className="input text-sm" placeholder="Bonjour, merci pour votre demande…" />
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">E-mail envoyé ✔ (consigné dans l&apos;historique)</p>}
      <button className="btn-primary btn-sm" disabled={pending}>{pending ? "Envoi…" : "Envoyer l'e-mail"}</button>
      <p className="text-xs text-navy/50">Le client peut répondre directement à l&apos;adresse de l&apos;entreprise. Pour un devis chiffré, utilisez « Créer un devis ».</p>
    </form>
  );
}
