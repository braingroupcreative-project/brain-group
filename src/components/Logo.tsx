import Image from "next/image";

/** Logo officiel Brain Group. `light` = version blanche, à utiliser sur fond bleu nuit. */
export function Logo({ light = false, className = "h-10" }: { light?: boolean; className?: string }) {
  return (
    <Image
      src={light ? "/logo-white.png" : "/logo.png"}
      alt="Brain Group"
      width={524}
      height={290}
      priority
      className={`w-auto ${className}`}
    />
  );
}
