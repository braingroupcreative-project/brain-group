"use client";
import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-5">
      <meta name="robots" content="noindex" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo light /></div>
        <form action={action} className="card space-y-4 p-6">
          <h1 className="text-xl">Espace administration</h1>
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="username" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
          </div>
          {state?.error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{state.error}</p>}
          <button className="btn-primary w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
        </form>
      </div>
    </main>
  );
}
