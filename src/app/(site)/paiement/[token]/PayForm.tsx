"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayForm({ token, suggested, max }: { token: string; suggested: number; max: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch(`/api/paiement/${token}`, { method: "POST", body: new FormData(e.currentTarget) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erreur");
      (e.target as HTMLFormElement).reset();
      setState("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setState("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <h3 className="text-base">J&apos;ai payé : déclarer mon paiement</h3>
      <div>
        <label className="label" htmlFor="amount">Montant payé (FCFA) *</label>
        <input id="amount" name="amount" inputMode="numeric" required defaultValue={suggested} min={1} max={max} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="tx_ref">Référence de transaction Wave *</label>
        <input id="tx_ref" name="tx_ref" required minLength={4} maxLength={60} className="input" placeholder="Ex. T_XXXXXXXX" />
      </div>
      <div>
        <label className="label" htmlFor="proof">Preuve de paiement (capture, facultatif)</label>
        <input id="proof" name="proof" type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full rounded-lg border border-dashed border-navy/30 bg-mist p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
      </div>
      {state === "err" && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <button className="btn-primary w-full" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Déclarer mon paiement"}</button>
      <p className="text-xs text-navy/50">Votre paiement sera confirmé par notre équipe après vérification dans notre espace Wave Marchand.</p>
    </form>
  );
}
