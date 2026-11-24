"use client";
import { useState } from "react";
import type { StockDocType } from "@/types/warehouse";

export interface SubmitResult<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

/** POST a stock document; keeps the server's message (e.g. BR03 409) for display. */
export function useSubmitDoc<T>(type: StockDocType) {
  const [saving, setSaving] = useState(false);
  const submit = async (body: Record<string, unknown>): Promise<SubmitResult<T>> => {
    setSaving(true);
    try {
      const res = await fetch("/api/warehouse/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      return res.ok ? { ok: true, data } : { ok: false, message: data.message ?? "Có lỗi xảy ra" };
    } catch {
      return { ok: false, message: "Không kết nối được máy chủ" };
    } finally {
      setSaving(false);
    }
  };
  return { submit, saving };
}
