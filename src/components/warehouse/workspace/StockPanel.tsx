"use client";
import { useState } from "react";
import { useStock } from "@/hooks/useStock";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/common/Button";

/** FR07/FR10/FR11 – stock by location with search and low-stock filter. */
export function StockPanel({ warehouseId }: { warehouseId: number }) {
  const { rows, loading, filters, update } = useStock(warehouseId);
  const [q, setQ] = useState(filters.q);
  const [loc, setLoc] = useState(filters.location);
  const lowCount = rows.filter((r) => r.isLow).length;

  return (
    <div>
      <form className="mb-3 flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); update({ q, location: loc }); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã vạch hoặc tên hàng" className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Vị trí, ví dụ A-01-03" className="w-44 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
        <Button type="submit" variant="secondary">Tìm</Button>
        <label className="ml-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.lowOnly} onChange={(e) => update({ lowOnly: e.target.checked })} />
          Chỉ hàng dưới mức tối thiểu
        </label>
        {lowCount > 0 && !filters.lowOnly && <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">{lowCount} mặt hàng dưới mức tối thiểu</span>}
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Vị trí</th><th>Mã vạch</th><th>Tên hàng</th><th className="text-right">Tồn</th><th className="text-right">Tối thiểu</th><th className="px-3">Cập nhật</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className={r.isLow ? "bg-amber-50" : ""}>
                <td className="px-3 py-2 font-mono">{r.locationCode}</td>
                <td className="font-mono">{r.barcode}</td>
                <td>{r.name}{r.isLow && <span className="ml-2 rounded bg-amber-200 px-1.5 text-xs text-amber-900">Sắp hết</span>}</td>
                <td className="text-right font-semibold">{r.quantity}</td>
                <td className="text-right text-slate-500">{r.minQty}</td>
                <td className="px-3 text-slate-500">{formatDateTime(r.updatedAt)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="py-8 text-center text-slate-400">{loading ? "Đang tải…" : "Không có hàng phù hợp"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
