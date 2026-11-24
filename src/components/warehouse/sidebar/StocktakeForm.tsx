"use client";
import { useState } from "react";
import { useStockLookup } from "@/hooks/useStock";
import { useSubmitDoc } from "@/hooks/useSubmitDoc";
import { stocktakeDiff } from "@/lib/stock";
import { Button } from "@/components/common/Button";
import { FormNotice, type Notice } from "./FormNotice";

interface Props {
  warehouseId: number;
  onSaved: () => void;
}

const keyOf = (barcode: string, loc: string) => `${barcode}@${loc}`;

/** UC08 – enter counted quantities; the slip waits for approval before stock changes (TC22). */
export function StocktakeForm({ warehouseId, onSaved }: Props) {
  const lookup = useStockLookup(warehouseId);
  const { submit, saving } = useSubmitDoc<{ code: string; diffs: number }>("STOCKTAKE");
  const [counted, setCounted] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice>(null);

  const entered = lookup.rows.filter((r) => counted[keyOf(r.barcode, r.locationCode)] !== undefined && counted[keyOf(r.barcode, r.locationCode)] !== "");

  const save = async () => {
    const lines = entered.map((r) => ({ barcode: r.barcode, locationCode: r.locationCode, counted: Number(counted[keyOf(r.barcode, r.locationCode)]) }));
    const res = await submit({ warehouseId, lines });
    if (!res.ok) return setNotice({ kind: "error", text: res.message });
    setNotice({ kind: "ok", text: `Đã trình ${res.data?.code} (${res.data?.diffs} dòng chênh lệch). Tồn kho chỉ thay đổi sau khi được duyệt ở tab Chứng từ.` });
    setCounted({});
    onSaved();
  };

  return (
    <div className="space-y-3">
      <FormNotice notice={notice} />
      <p className="text-sm text-slate-500">Nhập số đếm thực tế cho các mặt hàng đã kiểm. Dòng để trống sẽ không đưa vào phiếu.</p>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr><th className="py-2">Vị trí</th><th>Mã vạch</th><th>Tên hàng</th><th>Tồn hệ thống</th><th className="w-28">Thực tế</th><th>Chênh lệch</th></tr>
        </thead>
        <tbody className="divide-y">
          {lookup.rows.map((r) => {
            const k = keyOf(r.barcode, r.locationCode);
            const diff = counted[k] ? stocktakeDiff(r.quantity, Number(counted[k])) : null;
            return (
              <tr key={k}>
                <td className="py-1.5 font-mono">{r.locationCode}</td>
                <td className="font-mono">{r.barcode}</td>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td><input type="number" min={0} className="w-20 rounded border border-slate-300 px-2 py-1" value={counted[k] ?? ""} onChange={(e) => setCounted((c) => ({ ...c, [k]: e.target.value }))} /></td>
                <td className={diff ? (diff < 0 ? "font-semibold text-rose-600" : "font-semibold text-emerald-600") : "text-slate-400"}>
                  {diff === null ? "–" : diff > 0 ? `+${diff}` : diff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-end">
        <Button onClick={save} loading={saving} disabled={!entered.length}>Trình duyệt phiếu kiểm kê</Button>
      </div>
    </div>
  );
}
