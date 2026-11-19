export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <section className="bg-navy py-12 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold !text-white sm:text-4xl">{title}</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container-x max-w-3xl">
          <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Texte type à valider : les mentions entre crochets [ ] sont à compléter par Brain Group, et le contenu doit être relu au regard de la réglementation
            ivoirienne applicable (notamment sur la protection des données personnelles) avant la mise en production.
          </p>
          <div className="prose-bg">{children}</div>
        </div>
      </section>
    </>
  );
}
