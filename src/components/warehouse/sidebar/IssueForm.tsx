"use client";
import { useState } from "react";
import Link from "next/link";
import type { IssueLineInput, TripRef } from "@/types/warehouse";
import { useDocLines } from "@/hooks/useDocLines";
import { useStockLookup } from "@/hooks/useStock";
import { useFetch } from "@/hooks/useFetch";
import { useSubmitDoc } from "@/hooks/useSubmitDoc";
import { Button } from "@/components/common/Button";
import { SelectField } from "@/components/common/SelectField";
import { BarcodeInput } from "./BarcodeInput";
import { FormNotice, type Notice } from "./FormNotice";

interface Props {
  warehouseId: number;
  onSaved: () => void;
}

interface IssueResponse {
  id: number;
  code: string;
  lowStock: { barcode: string; name: string; quantity: number; minQty: number }[];
}

/** UC07 – issue by trip with barcode scanning; the server enforces BR03 (TC04) and reports low stock (TC24). */
export function IssueForm({ warehouseId, onSaved }: Props) {
  const lookup = useStockLookup(warehouseId);
  const trips = useFetch<TripRef[]>(`/api/warehouse/trips?warehouseId=${warehouseId}`);
  const doc = useDocLines<IssueLineInput>();
  const { submit, saving } = useSubmitDoc<IssueResponse>("ISSUE");
  const [tripId, setTripId] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);

  const available = (barcode: string) => lookup.find(barcode).reduce((s, r) => s + r.quantity, 0);

  const onScan = (barcode: string) => {
    if (!lookup.find(barcode).length) return setNotices([{ kind: "warn", text: `Mã ${barcode} không có trong kho này, không ghi nhận.` }]);
    setNotices([]);
    doc.add({ barcode, quantity: 1 });
  };

  const save = async () => {
    const res = await submit({ warehouseId, tripId: tripId || undefined, lines: doc.lines });
    if (!res.ok || !res.data) return setNotices([{ kind: "error", text: res.message }]);
    const d = res.data;
    const out: Notice[] = [{ kind: "ok", text: <>Đã xuất {d.code}. <Link className="underline" href={`/print/stock/${d.id}`} target="_blank">In phiếu xuất</Link></> }];
    d.lowStock.forEach((l) => out.push({ kind: "warn", text: `Cảnh báo: ${l.barcode} ${l.name} còn ${l.quantity}, dưới mức tối thiểu ${l.minQty} (FR11).` }));
    setNotices(out);
    doc.clear();
    setTripId("");
    lookup.reload();
    trips.reload();
    onSaved();
  };

  return (
    <div className="space-y-3">
      {notices.map((n, i) => <FormNotice key={i} notice={n} />)}
      <SelectField
        label="Chuyến xe (không bắt buộc)"
        placeholder="Xuất lẻ, không theo chuyến"
        options={(trips.data ?? []).map((t) => ({ value: t.id, label: `${t.code} · ${t.plate} · ${t.orderCount} đơn` }))}
        value={tripId}
        onChange={(e) => setTripId(e.target.value)}
      />
      <BarcodeInput onScan={onScan} />
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr><th className="py-2">Mã vạch</th><th>Tên hàng</th><th>Tồn</th><th className="w-28">SL xuất</th><th /></tr>
        </thead>
        <tbody className="divide-y">
          {doc.lines.map((l, i) => {
            const have = available(l.barcode);
            return (
              <tr key={l.barcode} className={l.quantity > have ? "bg-rose-50" : ""}>
                <td className="py-1.5 font-mono">{l.barcode}</td>
                <td>{lookup.find(l.barcode)[0]?.name}</td>
                <td>{have}</td>
                <td><input type="number" min={1} className="w-20 rounded border border-slate-300 px-2 py-1" value={l.quantity} onChange={(e) => doc.update(i, { quantity: Number(e.target.value) })} /></td>
                <td><button className="text-rose-500" onClick={() => doc.remove(i)}>Xóa</button></td>
              </tr>
            );
          })}
          {!doc.lines.length && <tr><td colSpan={5} className="py-6 text-center text-slate-400">Chưa có dòng hàng. Quét mã vạch để thêm.</td></tr>}
        </tbody>
      </table>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={doc.clear} disabled={!doc.lines.length}>Làm lại</Button>
        <Button onClick={save} loading={saving} disabled={!doc.lines.length}>Xác nhận xuất kho</Button>
      </div>
    </div>
  );
}
