"use client";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoPoint } from "@/types/routing";
import { HANOI_CENTER, OSM_ATTRIBUTION, OSM_TILES } from "@/constants/dispatch";

/** Fits the view to the given points whenever `fitKey` changes. */
function FitBounds({ points, fitKey }: { points: GeoPoint[]; fitKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points.map((p) => [p.lat, p.lng] as [number, number]), { padding: [30, 30] });
    else if (points.length === 1) map.setView([points[0].lat, points[0].lng], 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

interface Props {
  fitPoints: GeoPoint[];
  fitKey: string;
  className?: string;
  children?: React.ReactNode;
}

/** OpenStreetMap base layer (no paid map API, see CLAUDE.md). Must be loaded with ssr: false. */
export default function BaseMap({ fitPoints, fitKey, className = "h-[560px]", children }: Props) {
  return (
    <MapContainer center={HANOI_CENTER} zoom={12} className={`${className} w-full rounded-xl border`} scrollWheelZoom>
      <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
      <FitBounds points={fitPoints} fitKey={fitKey} />
      {children}
    </MapContainer>
  );
}
