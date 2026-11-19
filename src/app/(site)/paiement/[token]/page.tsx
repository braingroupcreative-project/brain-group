import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { fcfa, fmtDate } from "@/lib/utils";
import { PayForm } from "./PayForm";

export const metadata: Metadata = { title: "Paiement", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS = { a_verifier: ["En cours de vérification", "bg-amber-50 text-amber-700"], confirme: ["Confirmé", "bg-emerald-50 text-emerald-700"], rejete: ["Rejeté", "bg-rose-50 text-rose-700"] } as const;

export default async function Paiement({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = await db.findOne("quotes", { token });
  if (!q || q.status !== "accepte") notFound();
  const payments = (await db.list("payments", { quote_id: q.id })).reverse();
  const confirmed = payments.filter((p) => p.status === "confirme").reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status === "a_verifier").reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(0, q.total - confirmed);
  const depositDue = Math.max(0, q.deposit - confirmed);
  const suggested = depositDue > 0 ? depositDue : remaining;
  const hasQr = existsSync(path.join(process.cwd(), "public", "wave-qr.png"));

  return (
    <section className="bg-mist py-10 sm:py-14">
      <div className="container-x">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <p className="eyebrow">Règlement</p>
            <h1 className="mt-1 text-2xl">Devis {q.ref}</h1>
            <dl className="mt-5 space-y-3 text-sm">
              <Line l="Total du devis" v={fcfa(q.total)} />
              <Line l="Acompte demandé" v={fcfa(q.deposit)} />
              <Line l="Déjà payé (confirmé)" v={fcfa(confirmed)} />
              {pending > 0 && <Line l="En cours de vérification" v={fcfa(pending)} />}
              <div className="flex justify-between border-t border-navy/10 pt-3 text-lg font-bold"><dt>Reste à payer</dt><dd className="text-orange-700">{fcfa(remaining)}</dd></div>
            </dl>
            {remaining > 0 && depositDue > 0 && (
              <p className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">Montant à régler maintenant : <b>{fcfa(depositDue)}</b> (acompte).</p>
            )}
            {payments.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm">Vos paiements déclarés</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mist px-3 py-2">
                      <span>{fmtDate(p.paid_at)} · {fcfa(p.amount)} · <span className="text-navy/60">{p.tx_ref}</span></span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[p.status][1]}`}>{STATUS[p.status][0]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/proposition/${token}`} className="mt-6 inline-block text-sm font-semibold text-orange-700 hover:underline">← Revoir le devis</Link>
          </div>

          <div className="card p-6">
            <h2 className="text-lg">Payer avec Wave Marchand</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-navy/80">
              <li>Ouvrez l&apos;application Wave et scannez le QR Code ci-dessous.</li>
              <li>Saisissez le montant exact, puis validez le paiement.</li>
              <li>Notez la référence de transaction reçue et déclarez-la ci-dessous.</li>
            </ol>
            <div className="mt-5 grid place-items-center rounded-xl bg-white p-4 ring-1 ring-navy/10">
              {hasQr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/wave-qr.png" alt="QR Code Wave Marchand de Brain Group" width={240} height={240} className="h-60 w-60 object-contain" />
              ) : (
                <div className="grid h-60 w-60 place-items-center rounded-lg border-2 border-dashed border-navy/20 p-4 text-center text-sm text-navy/50">QR Code Wave Marchand à ajouter dans <code>/public/wave-qr.png</code></div>
              )}
            </div>
            {remaining > 0 ? (
              <PayForm token={token} suggested={suggested} max={remaining - pending > 0 ? remaining : remaining} />
            ) : (
              <p className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Le devis est intégralement réglé. Merci !</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Line({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-navy/60">{l}</dt><dd className="font-semibold">{v}</dd></div>;
}
