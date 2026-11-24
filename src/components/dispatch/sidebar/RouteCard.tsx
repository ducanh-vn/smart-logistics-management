"use client";
import type { PlanRoute } from "@/types/dispatch";
import type { DriverRow } from "@/types/fleet";
import type { GeoPoint } from "@/types/routing";
import { routeStats } from "@/lib/dispatch";
import { formatNumber } from "@/lib/format";

interface Props {
  route: PlanRoute;
  color: string;
  depot: GeoPoint;
  otherVehicles: { id: number; plate: string }[];
  drivers: DriverRow[];
  usedDriverIds: number[];
  focused: boolean;
  onFocus: () => void;
  onMove: (orderId: number, to: number | null) => void;
  onShift: (index: number, delta: -1 | 1) => void;
  onDriver: (driverId: number) => void;
}

/** One planned trip: load vs capacity (BR04), driver choice, stop order with manual edits (FR18). */
export function RouteCard({ route, color, depot, otherVehicles, drivers, usedDriverIds, focused, onFocus, onMove, onShift, onDriver }: Props) {
  const s = routeStats(depot, route);
  const pct = Math.min(100, Math.round((s.totalKg / route.capacityKg) * 100));
  return (
    <div className={`rounded-xl border bg-white ${focused ? "ring-2 ring-[var(--brand)]" : ""}`}>
      <button onClick={onFocus} className="flex w-full items-center gap-2 px-3 pt-3 text-left">
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        <span className="font-mono font-semibold">{route.plate}</span>
        <span className="ml-auto text-xs text-slate-500">{route.stops.length} điểm · {s.distanceKm} km · ~{Math.round(s.durationMin / 6) / 10} giờ</span>
      </button>
      <div className="px-3 py-2">
        <div className="h-1.5 rounded bg-slate-100"><div className={`h-1.5 rounded ${s.overloaded ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} /></div>
        <p className={`mt-1 text-xs ${s.overloaded ? "font-semibold text-rose-600" : "text-slate-500"}`}>
          {formatNumber(s.totalKg)}/{formatNumber(route.capacityKg)} kg · {s.totalM3}/{route.capacityM3} m³{s.overloaded && " · Vượt tải (BR04)"}
        </p>
        <select value={route.driverId ?? ""} onChange={(e) => onDriver(Number(e.target.value))} className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm">
          <option value="">– Chọn tài xế –</option>
          {drivers.filter((d) => d.id === route.driverId || !usedDriverIds.includes(d.id)).map((d) => (
            <option key={d.id} value={d.id}>{d.code} · {d.fullName} ({d.shift === "MORNING" ? "ca sáng" : "ca chiều"})</option>
          ))}
        </select>
      </div>
      {focused && (
        <ol className="max-h-72 divide-y overflow-y-auto border-t text-xs">
          {route.stops.map((st, i) => (
            <li key={st.orderId} className="flex items-center gap-1 px-3 py-1.5">
              <span className="w-5 text-slate-400">{i + 1}.</span>
              <span className="flex-1 truncate" title={`${st.address}, ${st.district}`}><b className="font-mono">{st.code.slice(-4)}</b> {st.district} · {st.weightKg} kg</span>
              <button className="px-1 text-slate-500 hover:text-black" onClick={() => onShift(i, -1)} title="Lên">↑</button>
              <button className="px-1 text-slate-500 hover:text-black" onClick={() => onShift(i, 1)} title="Xuống">↓</button>
              <select className="w-20 rounded border border-slate-300 text-xs" value="" onChange={(e) => onMove(st.orderId, e.target.value === "none" ? null : Number(e.target.value))}>
                <option value="">Chuyển</option>
                {otherVehicles.map((v) => <option key={v.id} value={v.id}>{v.plate}</option>)}
                <option value="none">Bỏ khỏi xe</option>
              </select>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
