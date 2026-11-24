"use client";

interface Props<K extends string> {
  tabs: { key: K; label: string }[];
  active: K;
  onChange: (key: K) => void;
}

export function Tabs<K extends string>({ tabs, active, onChange }: Props<K>) {
  return (
    <nav className="flex flex-wrap gap-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${active === t.key ? "bg-[var(--brand)] text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
