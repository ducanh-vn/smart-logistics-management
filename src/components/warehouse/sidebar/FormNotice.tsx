export type Notice = { kind: "ok" | "error" | "warn"; text: React.ReactNode } | null;

const STYLES = { ok: "bg-emerald-50 text-emerald-700", error: "bg-rose-50 text-rose-700", warn: "bg-amber-50 text-amber-800" };

export function FormNotice({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${STYLES[notice.kind]}`}>{notice.text}</div>;
}
