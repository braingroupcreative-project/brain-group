import "server-only";

/** Contrôle du type RÉEL du fichier (signature binaire), pas seulement de l'extension. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_FILES = 5;

const SIGS: { ext: string; mime: string; test: (b: Buffer) => boolean }[] = [
  { ext: "pdf", mime: "application/pdf", test: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { ext: "jpg", mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  // DOCX = archive ZIP (PK..)
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    test: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
];

export function detectFile(buf: Buffer, claimedName: string): { ext: string; mime: string } | null {
  const ext = (claimedName.split(".").pop() || "").toLowerCase().replace("jpeg", "jpg");
  const sig = SIGS.find((s) => s.test(buf));
  if (!sig) return null;
  if (sig.ext !== ext) return null; // extension incohérente avec le contenu
  return { ext: sig.ext, mime: sig.mime };
}

export const ALLOWED_LABEL = "PDF, JPG, PNG ou DOCX — 8 Mo maximum par fichier";
