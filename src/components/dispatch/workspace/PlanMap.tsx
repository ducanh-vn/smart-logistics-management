"use client";
import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { DispatchPlan } from "@/types/dispatch";
import { routeColor } from "@/constants/dispatch";
import BaseMap from "@/components/common/map/BaseMap";

interface Props {
  plan: DispatchPlan | null;
  depot: { lat: number; lng: number } | null;
  focus: number | null;
  pending: { lat: number; lng: number; code: string }[];
}

/** FR17 – routes drawn in stop order from the warehouse and back; unassigned orders in grey. */
export default function PlanMap({ plan, depot, focus, pending }: Props) {
  const points = plan ? [plan.depot, ...plan.routes.flatMap((r) => r.stops), ...plan.unassigned] : [...(depot ? [depot] : []), ...pending];
  const fitKey = plan ? `plan-${plan.routes.length}-${plan.elapsedMs}` : `pending-${pending.length}`;
  return (
    <BaseMap fitPoints={points} fitKey={fitKey}>
      {!plan && pending.map((p) => <CircleMarker key={p.code} center={[p.lat, p.lng]} radius={4} pathOptions={{ color: "#64748b", weight: 1, fillOpacity: 0.6 }} />)}
      {plan?.routes.map((r, i) => {
        const dim = focus !== null && focus !== r.vehicleId;
        const color = routeColor(i);
        const line = [plan.depot, ...r.stops, plan.depot].map((p) => [p.lat, p.lng] as [number, number]);
        return (
          <div key={r.vehicleId}>
            <Polyline positions={line} pathOptions={{ color, weight: dim ? 2 : 4, opacity: dim ? 0.25 : 0.9 }} />
            {r.stops.map((s, k) => (
              <CircleMarker key={s.orderId} center={[s.lat, s.lng]} radius={dim ? 3 : 6} pathOptions={{ color, fillColor: color, fillOpacity: dim ? 0.3 : 0.9 }}>
                <Tooltip>{`${r.plate} · điểm ${k + 1}: ${s.code} – ${s.receiverName} (${s.weightKg} kg)`}</Tooltip>
              </CircleMarker>
            ))}
          </div>
        );
      })}
      {plan?.unassigned.map((s) => (
        <CircleMarker key={s.orderId} center={[s.lat, s.lng]} radius={6} pathOptions={{ color: "#475569", fillColor: "#fff", fillOpacity: 1, dashArray: "2" }}>
          <Tooltip>{`Chưa xếp xe: ${s.code}`}</Tooltip>
        </CircleMarker>
      ))}
      {(plan?.depot ?? depot) && (
        <CircleMarker center={[(plan?.depot ?? depot)!.lat, (plan?.depot ?? depot)!.lng]} radius={10} pathOptions={{ color: "#1f3864", fillColor: "#1f3864", fillOpacity: 1 }}>
          <Tooltip permanent direction="top">Kho</Tooltip>
        </CircleMarker>
      )}
    </BaseMap>
  );
}
