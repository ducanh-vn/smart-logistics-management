"use client";
import { useState } from "react";
import type { StockLineInput } from "@/types/warehouse";
import { useDocLines } from "@/hooks/useDocLines";
import { useStockLookup } from "@/hooks/useStock";
import { useFetch } from "@/hooks/useFetch";
import { useSubmitDoc } from "@/hooks/useSubmitDoc";
import { Button } from "@/components/common/Button";
import { BarcodeInput } from "./BarcodeInput";
import { FormNotice, type Notice } from "./FormNotice";

interface Props {
  warehouseId: number;
  onSaved: () => void;
}

const cell = "rounded border border-slate-300 px-2 py-1 text-sm";

/** UC06 – receipt by scanning; new SKUs need a name and a storage location (FR10, TC23). */
export function ReceiptForm({ warehouseId, onSaved }: Props) {
  const lookup = useStockLookup(warehouseId);
  const { data: locations } = useFetch<{ code: string; skuCount: number }[]>(`/api/warehouse/locations?warehouseId=${warehouseId}`);
  const doc = useDocLines<StockLineInput>();
  const { submit, saving } = useSubmitDoc<{ code: string }>("RECEIPT");
  const [notice, setNotice] = useState<Notice>(null);

  const onScan = (barcode: string) => {
    const known = lookup.find(barcode)[0];
    doc.add({ barcode, name: known?.name ?? "", quantity: 1, locationCode: known?.locationCode ?? "" });
  };

  const save = async () => {
    const res = await submit({ warehouseId, lines: doc.lines });
    if (!res.ok) return setNotice({ kind: "error", text: res.message });
    setNotice({ kind: "ok", text: `Đã lưu ${res.data?.code}: ${doc.lines.length} dòng, tồn kho đã cập nhật.` });
    doc.clear();
    lookup.reload();
    onSaved();
  };

  return (
    <div className="space-y-3">
      <FormNotice notice={notice} />
      <BarcodeInput onScan={onScan} />
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr><th className="py-2">Mã vạch</th><th>Tên hàng</th><th className="w-24">SL</th><th className="w-36">Vị trí</th><th /></tr>
        </thead>
        <tbody className="divide-y">
          {doc.lines.map((l, i) => (
            <tr key={l.barcode}>
              <td className="py-1.5 font-mono">{l.barcode}</td>
              <td><input className={`${cell} w-full`} value={l.name} placeholder="Tên hàng mới" onChange={(e) => doc.update(i, { name: e.target.value })} /></td>
              <td><input type="number" min={1} className={`${cell} w-20`} value={l.quantity} onChange={(e) => doc.update(i, { quantity: Number(e.target.value) })} /></td>
              <td>
                <select className={`${cell} w-32`} value={l.locationCode} onChange={(e) => doc.update(i, { locationCode: e.target.value })}>
                  <option value="">Chọn ô</option>
                  {(locations ?? []).map((loc) => <option key={loc.code} value={loc.code}>{loc.code}{loc.skuCount ? "" : " (trống)"}</option>)}
                </select>
              </td>
              <td><button className="text-rose-500" onClick={() => doc.remove(i)}>Xóa</button></td>
            </tr>
          ))}
          {!doc.lines.length && <tr><td colSpan={5} className="py-6 text-center text-slate-400">Chưa có dòng hàng. Quét mã vạch để thêm.</td></tr>}
        </tbody>
      </table>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={doc.clear} disabled={!doc.lines.length}>Làm lại</Button>
        <Button onClick={save} loading={saving} disabled={!doc.lines.length}>Lưu phiếu nhập</Button>
      </div>
    </div>
  );
}
