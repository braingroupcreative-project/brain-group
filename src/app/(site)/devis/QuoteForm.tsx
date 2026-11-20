"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SERVICES, type ServiceKey } from "@/lib/site";
import { SERVICE_FIELDS, SERVICE_ATTACH_HINT, type Field } from "@/lib/form";

const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const EXT = ["pdf", "jpg", "jpeg", "png", "docx"];

type Values = Record<string, string | string[]>;

export function QuoteForm({ initialService }: { initialService?: ServiceKey }) {
  const router = useRouter();
  const [step, setStep] = useState(initialService ? 2 : 1);
  const [service, setService] = useState<ServiceKey | null>(initialService ?? null);
  const [v, setV] = useState<Values>({});
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [sending, setSending] = useState(false);
  const t0 = useRef(Date.now());
  const top = useRef<HTMLDivElement>(null);

  const set = (k: string, val: string | string[]) => {
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const str = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : "");
  const goto = (s: number) => {
    setStep(s);
    setServerError("");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function validateStep2() {
    const e: Record<string, string> = {};
    SERVICE_FIELDS[service!].forEach((f) => {
      if (f.required && !(f.type === "multi" ? (v[f.name] as string[] | undefined)?.length : str(f.name).trim())) e[f.name] = "Ce champ est requis";
      if (f.type === "number" && str(f.name) && !/^\d{1,7}$/.test(str(f.name))) e[f.name] = "Entrez un nombre valide";
    });
    setErrors(e);
    return !Object.keys(e).length;
  }
  function validateStep3() {
    const e: Record<string, string> = {};
    if (str("name").trim().length < 2) e.name = "Nom requis";
    if (!/^[\d+\s().-]{8,30}$/.test(str("phone").trim())) e.phone = "Numéro de téléphone invalide";
    if (!/^\S+@\S+\.\S+$/.test(str("email").trim())) e.email = "E-mail invalide";
    if (str("city").trim().length < 2) e.city = "Ville / commune requise";
    if (str("consent") !== "true") e.consent = "Votre consentement est requis";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const e: string[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!EXT.includes(ext)) e.push(`« ${f.name} » : format non autorisé`);
      else if (f.size > MAX_BYTES) e.push(`« ${f.name} » dépasse 8 Mo`);
      else if (next.length >= MAX_FILES) e.push(`${MAX_FILES} fichiers maximum`);
      else next.push(f);
    }
    setFiles(next);
    setErrors((p) => ({ ...p, files: e.join(" · ") }));
  }

  async function submit() {
    if (!service) return;
    setSending(true);
    setServerError("");
    const fd = new FormData();
    fd.set("service", service);
    SERVICE_FIELDS[service].forEach((f) => {
      const val = v[f.name];
      if (Array.isArray(val)) val.forEach((x) => fd.append(f.name, x));
      else if (val) fd.set(f.name, val);
    });
    ["name", "phone", "email", "company", "city", "message", "consent"].forEach((k) => fd.set(k, str(k)));
    files.forEach((f) => fd.append("files", f));
    fd.set("t", String(t0.current));
    try {
      const res = await fetch("/api/devis", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({} as Record<string, never>));
      if (!res.ok) {
        if (j.fields) {
          setErrors(j.fields);
          const hasStep2 = SERVICE_FIELDS[service].some((f) => j.fields[f.name]);
          goto(hasStep2 ? 2 : 3);
        }
        throw new Error(j.error || "Une erreur est survenue.");
      }
      router.push(`/devis/confirmation?ref=${encodeURIComponent(j.ref)}&service=${service}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSending(false);
    }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-sm text-rose-600" role="alert">{errors[k]}</p> : null);

  const renderField = (f: Field) => {
    const id = `f-${f.name}`;
    const common = { id, className: "input", "aria-invalid": !!errors[f.name], "aria-describedby": errors[f.name] ? `${id}-e` : undefined } as const;
    return (
      <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
        <label className="label" htmlFor={id}>{f.label}{f.required && " *"}</label>
        {f.type === "select" && (
          <select {...common} value={str(f.name)} onChange={(e) => set(f.name, e.target.value)}>
            <option value="">Choisir…</option>
            {f.options!.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        {(f.type === "text" || f.type === "date") && <input {...common} type={f.type} value={str(f.name)} placeholder={f.placeholder} maxLength={200} onChange={(e) => set(f.name, e.target.value)} />}
        {f.type === "number" && <input {...common} type="text" inputMode="numeric" value={str(f.name)} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value.replace(/\D/g, ""))} />}
        {f.type === "textarea" && <textarea {...common} rows={3} maxLength={1500} value={str(f.name)} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />}
        {f.type === "multi" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label={f.label}>
            {f.options!.map((o) => {
              const sel = ((v[f.name] as string[]) || []).includes(o);
              return (
                <button type="button" key={o} aria-pressed={sel} onClick={() => set(f.name, sel ? (v[f.name] as string[]).filter((x) => x !== o) : [...((v[f.name] as string[]) || []), o])}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${sel ? "border-orange bg-orange text-navy" : "border-navy/20 bg-white hover:border-navy/50"}`}>
                  {o}
                </button>
              );
            })}
          </div>
        )}
        <span id={`${id}-e`}><Err k={f.name} /></span>
      </div>
    );
  };

  const steps = ["Votre besoin", "Détails", "Coordonnées"];

  return (
    <div ref={top} className="scroll-mt-24">
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progression">
        {[...steps, "Récapitulatif"].map((s, i) => (
          <li key={s} aria-current={step === i + 1 ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${step >= i + 1 ? "bg-orange" : "bg-navy/10"}`} />
            <p className={`mt-2 hidden font-display text-xs font-bold sm:block ${step === i + 1 ? "text-navy" : "text-navy/40"}`}>{i + 1}. {s}</p>
            <p className={`mt-2 font-display text-xs font-bold sm:hidden ${step === i + 1 ? "text-navy" : "text-transparent"}`}>{i + 1}/4</p>
          </li>
        ))}
      </ol>

      {/* Étape 1 */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl">De quoi avez-vous besoin ?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.values(SERVICES).map((s) => (
              <button type="button" key={s.key} onClick={() => { setService(s.key); goto(2); }}
                className={`card flex flex-col items-start p-6 text-left transition hover:-translate-y-0.5 hover:ring-2 hover:ring-orange ${service === s.key ? "ring-2 ring-orange" : ""}`}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-700"><Icon name={s.icon} className="h-6 w-6" /></span>
                <span className="mt-4 font-display text-base font-bold">{s.label}</span>
                <span className="mt-1 text-sm text-navy/65">{s.blurb}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && service && (
        <div>
          <h2 className="text-2xl">Détails — {SERVICES[service].label}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">{SERVICE_FIELDS[service].map(renderField)}</div>
          <div className="mt-6">
            <label className="label" htmlFor="files">Pièces jointes</label>
            <p className="mb-2 text-sm text-navy/60">{SERVICE_ATTACH_HINT[service]} — PDF, JPG, PNG ou DOCX, 8 Mo max, {MAX_FILES} fichiers.</p>
            <input id="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              className="block w-full rounded-lg border border-dashed border-navy/30 bg-mist p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
            <Err k="files" />
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-mist px-3 py-2 text-sm">
                    <span className="truncate">{f.name} <span className="text-navy/50">({Math.round(f.size / 1024)} Ko)</span></span>
                    <button type="button" className="ml-3 text-rose-600 hover:underline" onClick={() => setFiles(files.filter((_, k) => k !== i))}>Retirer</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={() => goto(1)}>Retour</button>
            <button type="button" className="btn-primary" onClick={() => validateStep2() && goto(3)}>Continuer <Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl">Vos coordonnées</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ["name", "Nom et prénoms *", "text", "name"],
              ["phone", "Téléphone (WhatsApp de préférence) *", "tel", "tel"],
              ["email", "E-mail *", "email", "email"],
              ["company", "Entreprise (facultatif)", "text", "organization"],
              ["city", "Ville / commune *", "text", "address-level2"],
            ].map(([k, l, t, ac]) => (
              <div key={k}>
                <label className="label" htmlFor={`c-${k}`}>{l}</label>
                <input id={`c-${k}`} type={t} autoComplete={ac} className="input" value={str(k)} maxLength={160} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
                <Err k={k} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-message">Message complémentaire</label>
              <textarea id="c-message" rows={3} maxLength={4000} className="input" value={str("message")} onChange={(e) => set("message", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 text-sm text-navy/80">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-orange" checked={str("consent") === "true"} onChange={(e) => set("consent", e.target.checked ? "true" : "")} />
                <span>J&apos;accepte que Brain Group traite les informations transmises pour étudier ma demande et me recontacter, conformément à la <a href="/confidentialite" target="_blank" className="font-semibold text-orange-700 underline">politique de confidentialité</a>. *</span>
              </label>
              <Err k="consent" />
            </div>
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={() => goto(2)}>Retour</button>
            <button type="button" className="btn-primary" onClick={() => validateStep3() && goto(4)}>Voir le récapitulatif <Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Étape 4 : récapitulatif */}
      {step === 4 && service && (
        <div>
          <h2 className="text-2xl">Vérifiez votre demande</h2>
          <div className="card mt-6 divide-y divide-navy/10">
            <Row l="Service" r={SERVICES[service].label} />
            {SERVICE_FIELDS[service].map((f) => {
              const val = Array.isArray(v[f.name]) ? (v[f.name] as string[]).join(", ") : str(f.name);
              return val ? <Row key={f.name} l={f.label} r={val} /> : null;
            })}
            {files.length > 0 && <Row l="Pièces jointes" r={files.map((f) => f.name).join(", ")} />}
            <Row l="Nom" r={str("name")} />
            <Row l="Téléphone" r={str("phone")} />
            <Row l="E-mail" r={str("email")} />
            {str("company") && <Row l="Entreprise" r={str("company")} />}
            <Row l="Ville / commune" r={str("city")} />
            {str("message") && <Row l="Message" r={str("message")} />}
          </div>
          <div className="hidden" aria-hidden="true"><label>Site web<input tabIndex={-1} autoComplete="off" name="website" /></label></div>
          {serverError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{serverError}</p>}
          <div className="mt-8 flex justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={() => goto(3)} disabled={sending}>Modifier</button>
            <button type="button" className="btn-primary" onClick={submit} disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer ma demande"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ l, r }: { l: string; r: string }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr]">
      <dt className="text-sm font-semibold text-navy/60">{l}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm font-semibold">{r}</dd>
    </div>
  );
}
