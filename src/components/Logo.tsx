/* Logo provisoire en typographie. Dès réception du fichier officiel (SVG/PNG transparent) :
   déposez-le dans /public/logo.svg et remplacez le contenu de ce composant par <img src="/logo.svg" … />.
   Le PDF utilise automatiquement /public/logo.png s'il existe. */
export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-extrabold tracking-wide ${className}`} aria-label="Brain Group">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange text-navy" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
        </svg>
      </span>
      <span className={`text-lg leading-none ${light ? "text-white" : "text-navy"}`}>
        BRAIN <span className="text-orange">GROUP</span>
      </span>
    </span>
  );
}
