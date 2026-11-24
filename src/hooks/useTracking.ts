"use client";
import { useEffect, useState } from "react";
import type { TrackingResult } from "@/types/driver";
import { TRACKING_POLL_MS } from "@/constants/dispatch";

/** UC15 – public lookup by order code + receiver phone; refreshes while the order is on the way. */
export function useTracking() {
  const [query, setQuery] = useState<{ code: string; phone: string } | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (q: { code: string; phone: string }, quiet = false) => {
    if (!quiet) { setLoading(true); setError(null); }
    try {
      const res = await fetch(`/api/public/track?${new URLSearchParams(q)}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) { setResult(null); setError(body.message); return; }
      setResult(body);
    } catch {
      setError("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const search = (code: string, phone: string) => { const q = { code: code.trim(), phone: phone.trim() }; setQuery(q); load(q); };

  useEffect(() => {
    if (!query || !result || !["ASSIGNED", "DELIVERING"].includes(result.status)) return;
    const id = setInterval(() => load(query, true), TRACKING_POLL_MS);
    return () => clearInterval(id);
  }, [query, result]);

  return { search, result, error, loading };
}
