import type { DashboardData } from "@/types/report";
import { formatNumber } from "@/lib/format";

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** FR28 headline numbers for the selected day. */
export function KpiTiles({ d }: { d: DashboardData }) {
  const pct = d.onTimeRate === null ? "–" : `${formatNumber(d.onTimeRate * 100, 1)}%`;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Tile label="Đơn tạo trong ngày" value={formatNumber(d.totalOrders)} />
      <Tile label="Đơn đã giao" value={formatNumber(d.delivered)} />
      <Tile label="Giao đúng hẹn" value={pct} hint="Giao xong trước thời hạn hẹn" />
      <Tile label="Xe hoạt động" value={`${d.activeVehicles}/${d.totalVehicles}`} hint={`${d.trips} chuyến`} />
      <Tile label="Tổng quãng đường" value={`${formatNumber(d.totalKm)} km`} />
    </div>
  );
}
