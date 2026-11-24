import Link from "next/link";
import { MODULE_CARDS } from "@/constants/modules";

export function ModuleGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MODULE_CARDS.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[var(--brand)] hover:shadow"
        >
          <p className="text-xs font-medium text-slate-500">{m.fr}</p>
          <h2 className="mt-1 font-semibold text-[var(--brand)]">{m.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{m.desc}</p>
        </Link>
      ))}
    </div>
  );
}
