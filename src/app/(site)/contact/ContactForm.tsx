"use client";
import { useRef, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const t0 = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("t", String(t0.current));
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({} as Record<string, never>));
      if (!res.ok) throw new Error(j.error || "Erreur");
      setState("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setState("err");
    }
  }

  if (state === "ok")
    return (
      <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-emerald-800" role="status">
        <p className="font-display font-bold">Message envoyé ✔</p>
        <p className="mt-1 text-sm">Merci, nous vous répondons très rapidement.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate={false}>
      <div className="hidden" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-name">Nom et prénoms *</label><input id="c-name" name="name" required minLength={2} maxLength={120} className="input" autoComplete="name" /></div>
        <div><label className="label" htmlFor="c-phone">Téléphone</label><input id="c-phone" name="phone" type="tel" maxLength={30} className="input" autoComplete="tel" /></div>
      </div>
      <div><label className="label" htmlFor="c-email">E-mail *</label><input id="c-email" name="email" type="email" required maxLength={160} className="input" autoComplete="email" /></div>
      <div><label className="label" htmlFor="c-msg">Message *</label><textarea id="c-msg" name="message" required minLength={10} maxLength={3000} rows={5} className="input" /></div>
      <label className="flex items-start gap-3 text-sm text-navy/80">
        <input type="checkbox" name="consent" value="true" required className="mt-1 h-4 w-4 accent-orange" />
        J&apos;accepte que mes informations soient utilisées pour répondre à ma demande (voir la politique de confidentialité).
      </label>
      {state === "err" && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <button className="btn-primary w-full sm:w-auto" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Envoyer le message"}</button>
    </form>
  );
}
