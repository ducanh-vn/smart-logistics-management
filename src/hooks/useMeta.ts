"use client";
import type { MetaData } from "@/types/meta";
import { useFetch } from "./useFetch";

export function useMeta() {
  const { data } = useFetch<MetaData>("/api/meta");
  return { warehouses: data?.warehouses ?? [] };
}
