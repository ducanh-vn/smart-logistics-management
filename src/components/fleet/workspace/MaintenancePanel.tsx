"use client";
import type { VehicleRow } from "@/types/fleet";
import { MAINTENANCE_LABELS, VEHICLE_STATUS_LABELS } from "@/constants/fleet";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/common/Button";

interface Props {
  vehicles: VehicleRow[];
  canEdit: boolean;
  busy: boolean;
  error: string | null;
  onAction: (id: number, action: "START" | "FINISH") => void;
}

/** FR14 – vehicles due within 7 days or in the workshop; due vehicles are excluded from dispatch. */
export function MaintenancePanel({ vehicles, canEdit, busy, error, onAction }: Props) {
  const rows = vehicles
    .filter((v) => v.maintenance !== "OK" || v.status === "MAINTENANCE")
    .sort((a, b) => a.daysToService - b.daysToService);
  return (
    <div className="max-w-4xl">
      <p className="mb-3 text-sm text-slate-600">Hệ thống nhắc trước 7 ngày. Xe đến hạn bảo dưỡng không được phân chuyến cho tới khi hoàn tất bảo dưỡng.</p>
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="divide-y rounded-xl border bg-white">
        {rows.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="w-28 font-mono font-medium">{v.plate}</span>
            <span className="w-24 text-sm text-slate-500">{v.type}</span>
            <span className={`text-sm ${v.maintenance === "OVERDUE" ? "text-rose-600" : "text-amber-600"}`}>
              {formatDate(v.nextServiceAt)} · {v.daysToService <= 0 ? MAINTENANCE_LABELS.OVERDUE : `còn ${v.daysToService} ngày`}
            </span>
            <span className="text-sm text-slate-500">{VEHICLE_STATUS_LABELS[v.status]}</span>
            {canEdit && (
              <span className="ml-auto">
                {v.status === "MAINTENANCE" ? (
                  <Button variant="success" loading={busy} onClick={() => onAction(v.id, "FINISH")}>Hoàn tất bảo dưỡng</Button>
                ) : (
                  <Button variant="secondary" loading={busy} disabled={v.status === "ON_TRIP"} onClick={() => onAction(v.id, "START")}>Đưa vào bảo dưỡng</Button>
                )}
              </span>
            )}
          </div>
        ))}
        {!rows.length && <p className="px-4 py-8 text-center text-sm text-slate-400">Không có xe sắp đến hạn</p>}
      </div>
    </div>
  );
}
