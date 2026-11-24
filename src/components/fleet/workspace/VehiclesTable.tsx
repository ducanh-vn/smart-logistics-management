"use client";
import { useState } from "react";
import type { VehicleRow, VehicleStatus } from "@/types/fleet";
import { MAINTENANCE_LABELS, VEHICLE_STATUS_COLORS, VEHICLE_STATUS_LABELS } from "@/constants/fleet";
import { formatDate, formatNumber } from "@/lib/format";
import { SelectField } from "@/components/common/SelectField";

interface Props {
  vehicles: VehicleRow[];
  canEdit: boolean;
  onEdit: (v: VehicleRow) => void;
}

const STATUS_OPTIONS = Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const MAINT_STYLE = { OVERDUE: "text-rose-600 font-semibold", DUE_SOON: "text-amber-600 font-semibold", OK: "text-slate-500" };

/** FR13 – vehicle register with status, capacity and next service date. */
export function VehiclesTable({ vehicles, canEdit, onEdit }: Props) {
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [q, setQ] = useState("");
  const rows = vehicles.filter((v) => (!status || v.status === status) && v.plate.includes(q.toUpperCase()));
  const ready = vehicles.filter((v) => v.dispatchable).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm biển số" className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <SelectField className="w-40" placeholder="Mọi trạng thái" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as VehicleStatus | "")} />
        <span className="ml-auto text-sm text-slate-600">{ready}/{vehicles.length} xe có thể phân chuyến</span>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Biển số</th><th>Loại</th><th className="text-right">Tải trọng</th><th className="text-right">Thể tích</th><th className="px-3">Trạng thái</th><th>Chuyến hiện tại</th><th>Bảo dưỡng kế tiếp</th><th /></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="px-3 py-2 font-mono font-medium">{v.plate}</td>
                <td>{v.type}</td>
                <td className="text-right">{formatNumber(v.capacityKg)} kg</td>
                <td className="text-right">{v.capacityM3} m³</td>
                <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs ${VEHICLE_STATUS_COLORS[v.status]}`}>{VEHICLE_STATUS_LABELS[v.status]}</span></td>
                <td className="font-mono">{v.currentTrip ?? "–"}</td>
                <td className={MAINT_STYLE[v.maintenance]}>
                  {formatDate(v.nextServiceAt)}{v.maintenance !== "OK" && ` · ${MAINTENANCE_LABELS[v.maintenance]}`}
                </td>
                <td className="px-3 text-right">{canEdit && <button className="text-[var(--brand)] underline" onClick={() => onEdit(v)}>Sửa</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
