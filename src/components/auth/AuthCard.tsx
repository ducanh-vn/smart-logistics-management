import { vi } from "@/constants/i18n/vi";

export function AuthCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-500">{vi.company}</p>
        <h1 className="mb-1 text-lg font-bold text-[var(--brand)]">{vi.appName}</h1>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">{title}</h2>
        {note && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{note}</p>}
        {children}
      </div>
    </main>
  );
}
