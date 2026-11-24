"use client";
import { useCallback, useState } from "react";

/** Small helper for JSON POST/PATCH/DELETE calls with loading and error state. */
export function useMutation<TBody, TResult = unknown>(url: string, method: "POST" | "PATCH" | "PUT" | "DELETE" = "POST") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (body: TBody, overrideUrl?: string): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(overrideUrl ?? url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message ?? "Có lỗi xảy ra");
          return null;
        }
        return data as TResult;
      } catch {
        setError("Không kết nối được máy chủ");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method],
  );

  return { run, loading, error, setError };
}
