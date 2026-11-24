"use client";
import type { PlanStop } from "@/types/dispatch";

interface Props {
  stops: PlanStop[];
  vehicles: { id: number; plate: string }[];
  onMove: (orderId: number, to: number) => void;
}

/** Orders that did not fit any vehicle (BR04) – can be added to a route by hand. */
export function UnassignedCard({ stops, vehicles, onMove }: Props) {
  if (!stops.length) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
      <p className="mb-2 font-medium text-amber-900">{stops.length} đơn chưa xếp được xe (hết xe hoặc vượt tải)</p>
      <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
        {stops.map((s) => (
          <li key={s.orderId} className="flex items-center gap-2">
            <span className="flex-1 truncate"><b className="font-mono">{s.code}</b> {s.district} · {s.weightKg} kg</span>
            <select className="w-24 rounded border border-amber-300 bg-white" value="" onChange={(e) => onMove(s.orderId, Number(e.target.value))}>
              <option value="">Thêm vào</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
