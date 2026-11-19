"use client";
import { useState, useTransition } from "react";
import { saveQuote } from "../../../actions";
import { computeQuote, fcfa, lineTotal } from "@/lib/utils";
import type { QuoteLine } from "@/lib/types";

interface Initial {
  items: QuoteLine[];
  validity_days: number;
  conditions: string;
  delay: string;
  payment_terms: string;
  deposit_mode: "percent" | "amount";
  deposit_value: number;
}

export function QuoteEditor({ id, initial, locked }: { id: string; initial: Initial; locked: boolean }) {
  const [s, setS] = useState<Initial>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const { total, deposit } = computeQuote(s.items, s.deposit_mode, s.deposit_value);
  const patch = (p: Partial<Initial>) => { setS((x) => ({ ...x, ...p })); setMsg(null); };
  const setLine = (i: number, p: Partial<QuoteLine>) => patch({ items: s.items.map((l, k) => (k === i ? { ...l, ...p } : l)) });
  const num = (v: string) => (v === "" ? 0 : Number(v.replace(/[^\d.]/g, "")) || 0);

  function save() {
    start(async () => {
      const res = await saveQuote(id, s);
      setMsg({ ok: res.ok, text: res.ok ? "Devis enregistré ✔" : res.error || "Erreur" });
    });
  }

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-base">Lignes du devis</h2>
      <div className="space-y-3">
        <div className="hidden grid-cols-[1fr_80px_130px_80px_120px_36px] gap-2 px-1 text-xs font-bold uppercase text-navy/50 md:grid">
          <span>Désignation</span><span>Qté</span><span>Prix unitaire</span><span>Remise %</span><span className="text-right">Total</span><span />
        </div>
        {s.items.map((l, i) => (
          <div key={i} className="grid grid-cols-2 items-center gap-2 rounded-xl bg-mist p-3 md:grid-cols-[1fr_80px_130px_80px_120px_36px] md:bg-transparent md:p-0">
            <input className="input col-span-2 !py-2 text-sm md:col-span-1" placeholder="Désignation (prestation / produit)" aria-label={`Désignation ligne ${i + 1}`} value={l.label} disabled={locked} onChange={(e) => setLine(i, { label: e.target.value })} />
            <input className="input !py-2 text-sm" inputMode="decimal" aria-label="Quantité" placeholder="Qté" value={l.qty || ""} disabled={locked} onChange={(e) => setLine(i, { qty: num(e.target.value) })} />
            <input className="input !py-2 text-sm" inputMode="numeric" aria-label="Prix unitaire" placeholder="Prix unitaire" value={l.unit_price || ""} disabled={locked} onChange={(e) => setLine(i, { unit_price: num(e.target.value) })} />
            <input className="input !py-2 text-sm" inputMode="decimal" aria-label="Remise en pourcentage" placeholder="%" value={l.discount_pct || ""} disabled={locked} onChange={(e) => setLine(i, { discount_pct: Math.min(100, num(e.target.value)) })} />
            <p className="text-right text-sm font-bold">{fcfa(lineTotal(l))}</p>
            {!locked && s.items.length > 1 ? (
              <button type="button" aria-label="Supprimer la ligne" className="h-9 w-9 rounded-lg text-rose-600 hover:bg-rose-50" onClick={() => patch({ items: s.items.filter((_, k) => k !== i) })}>✕</button>
            ) : <span />}
          </div>
        ))}
      </div>
      {!locked && <button type="button" className="btn-ghost btn-sm mt-3" onClick={() => patch({ items: [...s.items, { label: "", qty: 1, unit_price: 0, discount_pct: 0 }] })}>+ Ajouter une ligne</button>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="delay">Délai estimatif</label>
            <input id="delay" className="input" disabled={locked} value={s.delay} onChange={(e) => patch({ delay: e.target.value })} placeholder="Ex. 5 jours ouvrables après acompte" />
          </div>
          <div>
            <label className="label" htmlFor="validity">Validité du devis (jours)</label>
            <input id="validity" className="input" inputMode="numeric" disabled={locked} value={s.validity_days} onChange={(e) => patch({ validity_days: num(e.target.value) })} />
          </div>
          <div>
            <label className="label" htmlFor="terms">Modalités de paiement</label>
            <textarea id="terms" rows={2} className="input" disabled={locked} value={s.payment_terms} onChange={(e) => patch({ payment_terms: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="cond">Conditions</label>
            <textarea id="cond" rows={3} className="input" disabled={locked} value={s.conditions} onChange={(e) => patch({ conditions: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-mist p-4">
            <p className="label !mb-2">Acompte</p>
            <div className="flex gap-2">
              <select className="input !py-2 text-sm" aria-label="Type d'acompte" disabled={locked} value={s.deposit_mode} onChange={(e) => patch({ deposit_mode: e.target.value as "percent" | "amount" })}>
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant fixe (FCFA)</option>
              </select>
              <input className="input !py-2 text-sm" inputMode="numeric" aria-label="Valeur de l'acompte" disabled={locked} value={s.deposit_value} onChange={(e) => patch({ deposit_value: num(e.target.value) })} />
            </div>
          </div>
          <dl className="space-y-2 rounded-xl bg-navy p-5 text-white">
            <div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd>{fcfa(total)}</dd></div>
            <div className="flex justify-between text-sm text-white/80"><dt>Acompte</dt><dd>{fcfa(deposit)}</dd></div>
            <div className="flex justify-between text-sm text-white/80"><dt>Solde</dt><dd>{fcfa(total - deposit)}</dd></div>
          </dl>
        </div>
      </div>

      {!locked && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-dark" onClick={save} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer le devis"}</button>
          {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.text}</p>}
          <p className="text-xs text-navy/50">Enregistrez avant d&apos;envoyer ou de prévisualiser le PDF.</p>
        </div>
      )}
      {locked && <p className="mt-5 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700">Ce devis est clôturé : il n&apos;est plus modifiable.</p>}
    </section>
  );
}
