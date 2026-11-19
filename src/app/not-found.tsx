import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-5 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-orange">404</p>
        <h1 className="mt-2 text-2xl">Page introuvable</h1>
        <p className="mt-2 text-navy/70">Le lien est peut-être incorrect ou la page a été déplacée.</p>
        <Link href="/" className="btn-primary mt-6">Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}
