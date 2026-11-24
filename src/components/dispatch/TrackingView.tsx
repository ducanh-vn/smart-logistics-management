"use client";
import { useState } from "react";
import { isDemoMode } from "@/lib/demo";
import dynamic from "next/dynamic";
import type { WarehouseRef } from "@/types/meta";
import { useTrips } from "@/hooks/useTrips";
import { TRIP_STATUS_COLORS, TRIP_STATUS_LABELS, routeColor } from "@/constants/dispatch";
import { formatNumber } from "@/lib/format";

const TrackingMap = dynamic(() => import("./workspace/TrackingMap"), { ssr: false, loading: () => <div className="h-[560px] animate-pulse rounded-xl bg-slate-100" /> });

/** UC11 / FR20 – today's trips with live positions (refresh every 10 s). */
export function TrackingView({ warehouse, canEdit }: { warehouse: WarehouseRef; canEdit: boolean }) {
  const t = useTrips(warehouse.id);
  const [focus, setFocus] = useState<number | null>(null);
  const running = t.trips.filter((x) => x.status === "RUNNING").length;

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-2">
        <div className="rounded-xl border bg-white p-3 text-sm">
          <p><b>{t.trips.length}</b> chuyến hôm nay · <b>{running}</b> đang chạy</p>
          <p className="text-xs text-slate-500">Tự cập nhật mỗi 10 giây{t.lastUpdate ? `, lần cuối ${t.lastUpdate.toLocaleTimeString("vi-VN")}` : ""}.</p>
          {canEdit && isDemoMode() && (
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={t.simulating} onChange={(e) => t.setSimulating(e.target.checked)} />
              Mô phỏng GPS cho các xe đang chạy (chỉ dùng khi chạy thử, thay cho điện thoại tài xế)
            </label>
          )}
        </div>
        <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
          {t.trips.map((trip, i) => (
            <button key={trip.id} onClick={() => setFocus(focus === trip.id ? null : trip.id)} className={`block w-full rounded-xl border bg-white p-3 text-left text-sm ${focus === trip.id ? "ring-2 ring-[var(--brand)]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: routeColor(i) }} />
                <span className="font-mono font-semibold">{trip.code}</span>
                <span className="font-mono text-slate-500">{trip.plate}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${TRIP_STATUS_COLORS[trip.status]}`}>{TRIP_STATUS_LABELS[trip.status]}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{trip.driverName} · {trip.doneCount}/{trip.stopCount} điểm · {formatNumber(trip.totalKg)} kg · {trip.totalKm} km</p>
              <div className="mt-1 h-1.5 rounded bg-slate-100"><div className="h-1.5 rounded bg-emerald-500" style={{ width: `${trip.stopCount ? (trip.doneCount / trip.stopCount) * 100 : 0}%` }} /></div>
            </button>
          ))}
          {!t.trips.length && <p className="rounded-xl border bg-white p-6 text-center text-sm text-slate-400">{t.loading ? "Đang tải…" : "Chưa có chuyến nào hôm nay"}</p>}
        </div>
      </aside>
      <TrackingMap trips={t.trips} depot={warehouse} focus={focus} />
    </div>
  );
}
