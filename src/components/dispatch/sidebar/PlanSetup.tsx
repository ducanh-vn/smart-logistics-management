"use client";
import type { VehicleRow } from "@/types/fleet";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/common/Button";

interface Props {
  orderCount: number;
  totalKg: number;
  vehicles: VehicleRow[];
  vehicleIds: number[];
  orderLimit: number;
  onOrderLimit: (n: number) => void;
  onToggle: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
  onOptimize: () => void;
  optimizing: boolean;
}

/** Step 1 of UC10: choose orders and vehicles, then run the optimizer. */
export function PlanSetup(p: Props) {
  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <p className="text-sm">
        <b>{p.orderCount}</b> đơn chờ phân xe, tổng <b>{formatNumber(p.totalKg)} kg</b>
      </p>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Số đơn đưa vào tối ưu (0 = tất cả)</span>
        <input type="number" min={0} max={p.orderCount} value={p.orderLimit} onChange={(e) => p.onOrderLimit(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Xe sử dụng ({p.vehicleIds.length || "tất cả"} / {p.vehicles.length} xe sẵn sàng)</span>
          <button className="text-xs text-[var(--brand)] underline" onClick={() => p.onSelectAll(p.vehicleIds.length ? [] : p.vehicles.map((v) => v.id))}>
            {p.vehicleIds.length ? "Bỏ chọn" : "Chọn hết"}
          </button>
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
          {p.vehicles.map((v) => (
            <label key={v.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.vehicleIds.includes(v.id)} onChange={() => p.onToggle(v.id)} />
              <span className="font-mono">{v.plate}</span>
              <span className="text-xs text-slate-500">{v.type} · {formatNumber(v.capacityKg)} kg</span>
              {v.maintenance === "DUE_SOON" && <span className="text-xs text-amber-600">sắp bảo dưỡng</span>}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">Không chọn xe nào thì hệ thống dùng mọi xe sẵn sàng. Xe đến hạn bảo dưỡng đã bị loại (FR14).</p>
      </div>
      <Button className="w-full" onClick={p.onOptimize} loading={p.optimizing} disabled={!p.orderCount}>Tối ưu tuyến</Button>
    </div>
  );
}
