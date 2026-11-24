"use client";
import { useDashboard } from "@/hooks/useDashboard";
import { KpiTiles } from "./workspace/KpiTiles";
import { StatusBarChart } from "./workspace/StatusBarChart";
import { TrendChart } from "./workspace/TrendChart";

/** UC16 – operations dashboard for a chosen day. */
export function DashboardScreen() {
  const { date, setDate, data, loading, error } = useDashboard();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600">Ngày</label>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {loading && <span className="text-sm text-slate-400">Đang tải…</span>}
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
      {data && (
        <>
          <KpiTiles d={data} />
          <StatusBarChart d={data} />
          <TrendChart d={data} />
        </>
      )}
    </div>
  );
}
