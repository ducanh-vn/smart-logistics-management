"use client";
import { useEffect, useState } from "react";
import { SETTING_DEFS } from "@/constants/admin";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/common/Button";

interface Props {
  settings: Record<string, string> | null;
  canEdit: boolean;
  onSave: (v: Record<string, string>) => Promise<boolean>;
  saving: boolean;
  error: string | null;
}

/** FR34 – system parameters. */
export function SettingsPanel({ settings, canEdit, onSave, saving, error }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  useEffect(() => { if (settings) setForm(settings); }, [settings]);
  return (
    <form className="max-w-lg space-y-3 rounded-xl border bg-white p-5" onSubmit={async (e) => { e.preventDefault(); setOk(await onSave(form)); }}>
      {SETTING_DEFS.map((d) => (
        <div key={d.key}>
          <FormField label={d.label} name={d.key} type={d.type} disabled={!canEdit} value={form[d.key] ?? ""} onChange={(e) => { setOk(false); setForm((f) => ({ ...f, [d.key]: e.target.value })); }} />
          {d.hint && <p className="mt-1 text-xs text-slate-500">{d.hint}</p>}
        </div>
      ))}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Đã lưu tham số</p>}
      {canEdit && <Button type="submit" loading={saving}>Lưu tham số</Button>}
    </form>
  );
}
