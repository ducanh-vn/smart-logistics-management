"use client";
import { usePerformanceReport } from "@/hooks/usePerformanceReport";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/common/Button";
import { PerformanceTable } from "./workspace/PerformanceTable";

/** UC17 – vehicle performance report with Excel and PDF export (FR29, FR30). */
export function ReportsScreen() {
  const { range, setRange, data, loading, error, excelUrl } = usePerformanceReport();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <label className="text-sm text-slate-600">Từ</label>
        <input type="date" value={range.from} onChange={(e) => e.target.value && setRange((r) => ({ ...r, from: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <label className="text-sm text-slate-600">đến</label>
        <input type="date" value={range.to} onChange={(e) => e.target.value && setRange((r) => ({ ...r, to: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {loading && <span className="text-sm text-slate-400">Đang tải…</span>}
        <div className="ml-auto flex gap-2">
          <a href={excelUrl} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Xuất Excel</a>
          <Button onClick={() => window.print()}>Xuất PDF</Button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {data && (
        <>
          <h2 className="hidden text-lg font-bold print:block">Báo cáo hiệu suất phương tiện từ {formatDate(data.from)} đến {formatDate(data.to)}</h2>
          <PerformanceTable r={data} />
          <p className="text-xs text-slate-500">Chi phí ước tính theo km: xe 1 tấn 6.000 đ, 1,5 tấn 7.500 đ, 2,5 tấn 9.500 đ (nhiên liệu, lốp, khấu hao).</p>
        </>
      )}
    </div>
  );
}
