"use client";
import { useActionState, useRef, useState } from "react";
import { createRealisation } from "../../actions";

export function RealisationForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await createRealisation(prev, fd);
    if (res.ok) {
      ref.current?.reset();
      setPreview(null);
    }
    return res;
  }, undefined);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="img">Image (JPG, PNG ou WebP — 5 Mo max) *</label>
        <input
          id="img"
          name="image"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          required
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="block w-full rounded-lg border border-dashed border-navy/30 bg-mist p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="mt-3 max-h-40 rounded-lg bg-white object-contain ring-1 ring-navy/10" />
        )}
      </div>
      <div>
        <label className="label" htmlFor="rt">Titre *</label>
        <input id="rt" name="title" required minLength={2} maxLength={120} className="input !py-2" placeholder="Ex. Logo — Nom du client" />
      </div>
      <div>
        <label className="label" htmlFor="rc">Légende</label>
        <input id="rc" name="caption" maxLength={300} className="input !py-2" placeholder="Ex. Création d'identité visuelle" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="rs">Activité *</label>
          <select id="rs" name="service" className="input !py-2" defaultValue="imprimerie">
            <option value="evenementiel">Événementiel</option>
            <option value="imprimerie">Imprimerie & communication</option>
            <option value="informatique">Informatique</option>
            <option value="digital">Digital &amp; IA</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rf">Affichage</label>
          <select id="rf" name="fit" className="input !py-2" defaultValue="cover">
            <option value="cover">Photo (remplit le cadre)</option>
            <option value="contain">Logo (image entière)</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" className="h-4 w-4 accent-orange" /> Mettre en avant (page d&apos;accueil)
      </label>
      {state?.error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">Réalisation ajoutée et publiée ✔</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Envoi…" : "Publier la réalisation"}</button>
    </form>
  );
}
