"use client";
import { useEffect, useRef, useState } from "react";
import { GPS_INTERVAL_SECONDS } from "@/constants/business";

export type GpsState = "off" | "waiting" | "sending" | "denied" | "unsupported";

/** FR23 – while a trip is running, sends the phone position at most once every 30 s. */
export function useGpsReporter(active: boolean) {
  const [state, setState] = useState<GpsState>("off");
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const lastRef = useRef(0);
  const fixRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!active) return setState("off");
    if (typeof navigator === "undefined" || !navigator.geolocation) return setState("unsupported");
    setState("waiting");
    const send = (p: GeolocationPosition) => {
      fixRef.current = { lat: p.coords.latitude, lng: p.coords.longitude };
      if (Date.now() - lastRef.current < GPS_INTERVAL_SECONDS * 1000) return;
      lastRef.current = Date.now();
      fetch("/api/driver/position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude, speedKmh: (p.coords.speed ?? 0) * 3.6 }),
      }).then((r) => { if (r.ok) { setState("sending"); setLastSent(new Date()); } }).catch(() => undefined);
    };
    const id = navigator.geolocation.watchPosition(send, (e) => setState(e.code === e.PERMISSION_DENIED ? "denied" : "waiting"), { enableHighAccuracy: true, maximumAge: 10_000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [active]);

  return { state, lastSent, lastFix: () => fixRef.current };
}
