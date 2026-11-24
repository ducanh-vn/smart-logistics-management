"use client";
import Link from "next/link";
import { useWarehouseDocs } from "@/hooks/useWarehouseDocs";
import { DOC_STATUS_LABELS, DOC_TYPE_LABELS } from "@/constants/warehouse";
import { formatDateTime } from "@/lib/format";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/common/Button";
import type { StockDocType } from "@/types/warehouse";

const TYPE_OPTIONS = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_STYLE = { DRAFT: "bg-slate-100 text-slate-600", PENDING: "bg-amber-100 text-amber-800", DONE: "bg-emerald-100 text-emerald-700" };

/** Receipt / issue / stocktake slips; pending stocktakes can be approved, every slip can be printed (FR12). */
export function DocumentsPanel({ warehouseId, canEdit }: { warehouseId: number; canEdit: boolean }) {
  const { docs, loading, type, setType, approve, approving, error } = useWarehouseDocs(warehouseId);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <SelectField className="w-48" placeholder="Mọi loại phiếu" options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value as StockDocType | "")} />
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Số phiếu</th><th>Loại</th><th>Chuyến</th><th className="text-right">Số dòng</th><th className="text-right">Tổng SL</th><th className="px-3">Người lập</th><th>Thời gian</th><th>Trạng thái</th><th /></tr>
          </thead>
          <tbody className="divide-y">
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-mono font-medium">{d.code}</td>
                <td>{DOC_TYPE_LABELS[d.type]}</td>
                <td className="font-mono">{d.tripCode ?? "–"}</td>
                <td className="text-right">{d.lineCount}</td>
                <td className="text-right">{d.totalQty}</td>
                <td className="px-3">{d.createdBy}</td>
                <td className="text-slate-500">{formatDateTime(d.createdAt)}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[d.status]}`}>{DOC_STATUS_LABELS[d.status]}</span></td>
                <td className="whitespace-nowrap px-3 text-right">
                  {canEdit && d.type === "STOCKTAKE" && d.status === "PENDING" && (
                    <Button variant="success" className="mr-2 px-2 py-1 text-xs" loading={approving} onClick={() => approve(d.id)}>Duyệt</Button>
                  )}
                  <Link href={`/print/stock/${d.id}`} target="_blank" className="text-[var(--brand)] underline">Xem / In</Link>
                </td>
              </tr>
            ))}
            {!docs.length && <tr><td colSpan={9} className="py-8 text-center text-slate-400">{loading ? "Đang tải…" : "Chưa có chứng từ"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
