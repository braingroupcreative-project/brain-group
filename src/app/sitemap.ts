import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ["", 1],
    ["/services/evenementiel", 0.9],
    ["/services/imprimerie", 0.9],
    ["/services/informatique", 0.9],
    ["/services/digital", 0.9],
    ["/realisations", 0.7],
    ["/a-propos", 0.6],
    ["/contact", 0.6],
    ["/devis", 0.9],
    ["/mentions-legales", 0.2],
    ["/confidentialite", 0.2],
    ["/conditions", 0.2],
  ] as const;
  return paths.map(([p, priority]) => ({ url: `${SITE.url}${p}`, lastModified: new Date(), priority }));
}
