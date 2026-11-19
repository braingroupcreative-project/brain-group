"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

export function AdminNav({ items }: { items: { href: string; label: string; icon: string }[] }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Administration">
      {items.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-orange text-navy" : "text-white/80 hover:bg-white/10"}`}>
            <Icon name={i.icon} className="h-4 w-4" /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
