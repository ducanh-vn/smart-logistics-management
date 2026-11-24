"use client";
import { CircleMarker, Tooltip } from "react-leaflet";
import BaseMap from "@/components/common/map/BaseMap";

interface Props {
  vehicle: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
}

/** Current truck position and the delivery point (FR26). */
export default function TrackingMiniMap({ vehicle, destination }: Props) {
  const points = [vehicle, ...(destination ? [destination] : [])];
  return (
    <BaseMap fitPoints={points} fitKey={`${vehicle.lat}-${vehicle.lng}`} className="h-64">
      <CircleMarker center={[vehicle.lat, vehicle.lng]} radius={10} pathOptions={{ color: "#1f3864", fillColor: "#1f77b4", fillOpacity: 1 }}>
        <Tooltip permanent direction="top">Xe giao hàng</Tooltip>
      </CircleMarker>
      {destination && (
        <CircleMarker center={[destination.lat, destination.lng]} radius={8} pathOptions={{ color: "#d62728", fillColor: "#fff", fillOpacity: 1 }}>
          <Tooltip permanent direction="bottom">Điểm giao</Tooltip>
        </CircleMarker>
      )}
    </BaseMap>
  );
}
