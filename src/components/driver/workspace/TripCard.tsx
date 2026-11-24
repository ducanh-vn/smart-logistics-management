"use client";
import type { DriverTrip } from "@/types/driver";
import type { GpsState } from "@/hooks/useGpsReporter";
import { TRIP_STATUS_COLORS, TRIP_STATUS_LABELS } from "@/constants/dispatch";
import { Button } from "@/components/common/Button";

interface Props {
  trips: DriverTrip[];
  trip: DriverTrip;
  onPick: (id: number) => void;
  onStart: () => void;
  starting: boolean;
  gps: GpsState;
  lastSent: Date | null;
}

const GPS_TEXT: Record<GpsState, string> = {
  off: "GPS: tắt (chỉ gửi khi chuyến đang chạy)",
  waiting: "GPS: đang lấy vị trí…",
  sending: "GPS: đang gửi vị trí",
  denied: "GPS: bị chặn, hãy cho phép truy cập vị trí",
  unsupported: "GPS: thiết bị không hỗ trợ",
};

/** Trip header: choose trip, start it, GPS status (FR21, FR23). */
export function TripCard({ trips, trip, onPick, onStart, starting, gps, lastSent }: Props) {
  const done = trip.stops.filter((s) => s.doneAt).length;
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      {trips.length > 1 && (
        <select className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={trip.id} onChange={(e) => onPick(Number(e.target.value))}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.code} · {TRIP_STATUS_LABELS[t.status]}</option>)}
        </select>
      )}
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold">{trip.code}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${TRIP_STATUS_COLORS[trip.status]}`}>{TRIP_STATUS_LABELS[trip.status]}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">Xe <b className="font-mono">{trip.plate}</b> · {trip.warehouseName} · {trip.totalKm} km</p>
      <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-500" style={{ width: `${(done / Math.max(1, trip.stops.length)) * 100}%` }} /></div>
      <p className="mt-1 text-xs text-slate-500">Đã xử lý {done}/{trip.stops.length} điểm</p>
      {trip.status === "DISPATCHED" && <Button className="mt-3 w-full py-3 text-base" onClick={onStart} loading={starting}>Đã nhận hàng, bắt đầu chuyến</Button>}
      {trip.status === "RUNNING" && (
        <p className={`mt-2 text-xs ${gps === "sending" ? "text-emerald-700" : "text-amber-700"}`}>
          {GPS_TEXT[gps]}{lastSent ? `, lần cuối ${lastSent.toLocaleTimeString("vi-VN")}` : ""}
        </p>
      )}
    </section>
  );
}
