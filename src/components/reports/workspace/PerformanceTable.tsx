import type { PerformanceReport } from "@/types/report";
import { formatNumber, formatVnd } from "@/lib/format";

const pct = (x: number) => `${formatNumber(x * 100, 1)}%`;

/** FR29 – per-vehicle table; the same numbers go to Excel and PDF (TC41). */
export function PerformanceTable({ r }: { r: PerformanceReport }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white print:border-0">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr><th className="px-3 py-2">Biển số</th><th>Loại xe</th><th className="text-right">Chuyến</th><th className="text-right">Điểm giao</th><th className="text-right">Quãng đường</th><th className="text-right">Khối lượng</th><th className="text-right">Tải trọng sử dụng</th><th className="text-right">Chi phí</th><th className="px-3 text-right">Chi phí/điểm</th></tr>
        </thead>
        <tbody className="divide-y">
          {r.rows.map((v) => (
            <tr key={v.vehicleId}>
              <td className="px-3 py-1.5 font-mono">{v.plate}</td>
              <td>{v.type}</td>
              <td className="text-right">{v.trips}</td>
              <td className="text-right">{formatNumber(v.stops)}</td>
              <td className="text-right">{formatNumber(v.totalKm, 1)} km</td>
              <td className="text-right">{formatNumber(v.totalKg)} kg</td>
              <td className="text-right">{pct(v.loadFactor)}</td>
              <td className="text-right">{formatVnd(v.cost)}</td>
              <td className="px-3 text-right">{formatVnd(v.costPerStop)}</td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-semibold">
            <td className="px-3 py-2" colSpan={2}>Tổng cộng ({r.rows.length} xe)</td>
            <td className="text-right">{r.totals.trips}</td>
            <td className="text-right">{formatNumber(r.totals.stops)}</td>
            <td className="text-right">{formatNumber(r.totals.totalKm)} km</td>
            <td className="text-right">{formatNumber(r.totals.totalKg)} kg</td>
            <td className="text-right">{pct(r.totals.loadFactor)}</td>
            <td className="text-right">{formatVnd(r.totals.cost)}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
