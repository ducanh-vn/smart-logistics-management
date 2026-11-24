"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { WarehouseRef } from "@/types/meta";
import { routeStats } from "@/lib/dispatch";
import { routeColor } from "@/constants/dispatch";
import { useDispatchPlan } from "@/hooks/useDispatchPlan";
import { Button } from "@/components/common/Button";
import { PlanSetup } from "./sidebar/PlanSetup";
import { RouteCard } from "./sidebar/RouteCard";
import { UnassignedCard } from "./sidebar/UnassignedCard";

const PlanMap = dynamic(() => import("./workspace/PlanMap"), { ssr: false, loading: () => <div className="h-[560px] animate-pulse rounded-xl bg-slate-100" /> });

/** UC10 – plan, adjust and confirm today's trips for one warehouse. */
export function PlanView({ warehouse, canEdit }: { warehouse: WarehouseRef; canEdit: boolean }) {
  const d = useDispatchPlan(warehouse.id);
  const [focus, setFocus] = useState<number | null>(null);
  const plan = d.plan;
  const vehicleRefs = plan?.routes.map((r) => ({ id: r.vehicleId, plate: r.plate })) ?? [];
  const usedDrivers = plan?.routes.map((r) => r.driverId).filter((x): x is number => x !== null) ?? [];
  const blocked = plan ? plan.routes.some((r) => r.stops.length && (r.driverId === null || routeStats(plan.depot, r).overloaded)) : true;
  const assigned = plan?.routes.reduce((n, r) => n + r.stops.length, 0) ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-3">
        {d.done && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Đã tạo và gửi {d.done.length} chuyến đến app tài xế: {d.done.join(", ")}.</div>}
        {d.error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{d.error}</div>}
        {!plan && canEdit && (
          <PlanSetup
            orderCount={d.orders.length} totalKg={d.orders.reduce((s, o) => s + o.weightKg, 0)}
            vehicles={d.vehicles} vehicleIds={d.vehicleIds} orderLimit={d.orderLimit}
            onOrderLimit={d.setOrderLimit} onToggle={d.toggleVehicle} onSelectAll={d.setVehicleIds}
            onOptimize={d.optimize} optimizing={d.optimizing}
          />
        )}
        {!canEdit && <p className="rounded-xl border bg-white p-4 text-sm text-slate-600">Bạn chỉ có quyền xem. {d.orders.length} đơn đang chờ phân xe.</p>}
        {plan && (
          <>
            <div className="rounded-xl border bg-white p-3 text-sm">
              <p><b>{plan.routes.length}</b> chuyến · <b>{assigned}</b> đơn đã xếp · tính trong <b>{plan.elapsedMs < 1000 ? `${plan.elapsedMs} ms` : `${(plan.elapsedMs / 1000).toFixed(1)} giây`}</b></p>
              <p className="text-xs text-slate-500">Bấm vào từng xe để xem thứ tự điểm giao, đổi thứ tự hoặc chuyển đơn sang xe khác.</p>
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" onClick={() => d.setPlan(null)}>Làm lại</Button>
                <Button variant="success" className="flex-1" onClick={d.confirm} loading={d.confirming} disabled={blocked}>Xác nhận và gửi lệnh</Button>
              </div>
              {blocked && <p className="mt-1 text-xs text-rose-600">Cần chọn tài xế cho mọi xe và không xe nào vượt tải.</p>}
            </div>
            <UnassignedCard stops={plan.unassigned} vehicles={vehicleRefs} onMove={d.edit.move} />
            <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {plan.routes.map((r, i) => (
                <RouteCard
                  key={r.vehicleId} route={r} color={routeColor(i)} depot={plan.depot}
                  otherVehicles={vehicleRefs.filter((v) => v.id !== r.vehicleId)}
                  drivers={d.drivers} usedDriverIds={usedDrivers} focused={focus === r.vehicleId}
                  onFocus={() => setFocus(focus === r.vehicleId ? null : r.vehicleId)}
                  onMove={d.edit.move} onShift={(idx, delta) => d.edit.shift(r.vehicleId, idx, delta)}
                  onDriver={(driverId) => d.edit.setDriver(r.vehicleId, driverId)}
                />
              ))}
            </div>
          </>
        )}
      </aside>
      <PlanMap plan={plan} depot={warehouse} focus={focus} pending={d.orders} />
    </div>
  );
}
