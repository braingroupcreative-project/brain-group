import { STATUS_LABELS, STATUS_TONE } from "@/lib/site";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${STATUS_TONE[status] || "bg-zinc-100 text-zinc-600 ring-zinc-200"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
