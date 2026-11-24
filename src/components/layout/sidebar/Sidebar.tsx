"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types/auth";
import { NAV_ITEMS } from "@/constants/nav";
import { canAccess } from "@/lib/permissions";

export function Sidebar({ role }: { role: Role }) {
  const path = usePathname();
  const items = NAV_ITEMS.filter((n) => canAccess(role, n.module) && !(role === "DRIVER" && n.module === "fleet"));
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:w-52 md:flex-col md:border-b-0 md:border-r md:px-3 md:py-4">
      {items.map((n) => {
        const active = path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-[var(--brand-light)] font-semibold text-[var(--brand)]" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
