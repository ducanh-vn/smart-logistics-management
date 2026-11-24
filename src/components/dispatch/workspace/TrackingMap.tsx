"use client";
import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { TripSummary } from "@/types/dispatch";
import { routeColor } from "@/constants/dispatch";
import { formatDateTime } from "@/lib/format";
import BaseMap from "@/components/common/map/BaseMap";

interface Props {
  trips: TripSummary[];
  depot: { lat: number; lng: number } | null;
  focus: number | null;
}

/** FR20 / TC05 – planned path per trip, delivered stops filled, truck position as a large dot. */
export default function TrackingMap({ trips, depot, focus }: Props) {
  const shown = focus ? trips.filter((t) => t.id === focus) : trips;
  const points = [...(depot ? [depot] : []), ...shown.flatMap((t) => t.path)];
  return (
    <BaseMap fitPoints={points} fitKey={`${focus ?? "all"}-${trips.length}`}>
      {shown.map((t) => {
        const color = routeColor(trips.indexOf(t));
        const line = [...(depot ? [depot] : []), ...t.path].map((p) => [p.lat, p.lng] as [number, number]);
        return (
          <div key={t.id}>
            <Polyline positions={line} pathOptions={{ color, weight: 3, opacity: 0.6, dashArray: t.status === "DISPATCHED" ? "6" : undefined }} />
            {t.path.map((p) => (
              <CircleMarker key={p.seq} center={[p.lat, p.lng]} radius={5} pathOptions={{ color, fillColor: p.done ? color : "#fff", fillOpacity: 1 }}>
                <Tooltip>{`${t.code} · điểm ${p.seq}: ${p.code}${p.done ? " (đã xong)" : ""}`}</Tooltip>
              </CircleMarker>
            ))}
            {t.position && (
              <CircleMarker center={[t.position.lat, t.position.lng]} radius={11} pathOptions={{ color: "#111827", fillColor: color, fillOpacity: 1, weight: 3 }}>
                <Tooltip permanent direction="right">{`${t.plate} · ${formatDateTime(t.position.recordedAt).slice(0, 5)}`}</Tooltip>
              </CircleMarker>
            )}
          </div>
        );
      })}
      {depot && <CircleMarker center={[depot.lat, depot.lng]} radius={10} pathOptions={{ color: "#1f3864", fillColor: "#1f3864", fillOpacity: 1 }} />}
    </BaseMap>
  );
}
