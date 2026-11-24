"use client";
import { useState } from "react";
import type { StockDocSummary, StockDocType } from "@/types/warehouse";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** Document list of a warehouse plus stocktake approval. */
export function useWarehouseDocs(warehouseId: number | null) {
  const [type, setType] = useState<StockDocType | "">("");
  const url = warehouseId ? `/api/warehouse/documents?warehouseId=${warehouseId}${type ? `&type=${type}` : ""}` : null;
  const { data, loading, reload } = useFetch<StockDocSummary[]>(url);
  const approveCall = useMutation<Record<string, never>, { code: string }>("", "POST");

  const approve = async (id: number) => {
    const res = await approveCall.run({}, `/api/warehouse/documents/${id}/approve`);
    if (res) reload();
    return res;
  };
  return { docs: data ?? [], loading, reload, type, setType, approve, approving: approveCall.loading, error: approveCall.error };
}
