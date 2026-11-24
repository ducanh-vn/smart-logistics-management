"use client";
import { useEffect, useState } from "react";
import type { PriceRule } from "@/types/order";
import { ZONE_LABELS } from "@/constants/pricing";
import { calculateFee } from "@/lib/pricing";
import { formatVnd } from "@/lib/format";
import { Button } from "@/components/common/Button";

interface Props {
  prices: PriceRule[];
  canEdit: boolean;
  onSave: (r: PriceRule) => Promise<boolean>;
  saving: boolean;
  error: string | null;
}

const SAMPLE_KG = 12;

/** FR34 / TC43 – edit the BR01 price table; preview shows the fee of a 12 kg parcel. */
export function PricingPanel({ prices, canEdit, onSave, saving, error }: Props) {
  const [draft, setDraft] = useState<PriceRule[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => setDraft(prices), [prices]);
  const set = (zone: string, k: keyof PriceRule, v: string) => setDraft((d) => d.map((r) => (r.zone === zone ? { ...r, [k]: Number(v) } : r)));

  return (
    <div className="max-w-4xl space-y-3">
      <p className="text-sm text-slate-600">Giá mới áp dụng cho đơn tạo sau khi lưu. Cước của đơn đã tạo được giữ nguyên.</p>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saved}</p>}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Vùng</th><th>Giá cơ bản (đ)</th><th>Đến (kg)</th><th>Mỗi kg vượt (đ)</th><th>Ví dụ {SAMPLE_KG} kg</th><th /></tr>
          </thead>
          <tbody className="divide-y">
            {draft.map((r) => (
              <tr key={r.zone}>
                <td className="px-3 py-2 font-medium">{ZONE_LABELS[r.zone]}</td>
                {(["baseFee", "includedKg", "perKgFee"] as const).map((k) => (
                  <td key={k}><input type="number" min={0} disabled={!canEdit} value={r[k]} onChange={(e) => set(r.zone, k, e.target.value)} className="w-28 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-50" /></td>
                ))}
                <td className="font-semibold">{formatVnd(calculateFee(SAMPLE_KG, r.zone, [r]))}</td>
                <td className="px-3 text-right">
                  {canEdit && <Button className="px-3 py-1 text-xs" loading={saving} onClick={async () => { setSaved(null); if (await onSave(r)) setSaved(`Đã lưu giá ${ZONE_LABELS[r.zone]}`); }}>Lưu</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
