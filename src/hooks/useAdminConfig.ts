"use client";
import type { PriceRule } from "@/types/order";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

/** FR34 – price table and system settings. */
export function useAdminConfig() {
  const prices = useFetch<PriceRule[]>("/api/admin/pricing");
  const settings = useFetch<Record<string, string>>("/api/admin/settings");
  const savePrice = useMutation<PriceRule, PriceRule>("/api/admin/pricing", "PATCH");
  const saveSettings = useMutation<Record<string, string>, Record<string, string>>("/api/admin/settings", "PUT");

  const updatePrice = async (rule: PriceRule) => {
    const r = await savePrice.run(rule);
    if (r) prices.setData((list) => (list ?? []).map((x) => (x.zone === r.zone ? r : x)));
    return !!r;
  };
  const updateSettings = async (values: Record<string, string>) => {
    const r = await saveSettings.run(values);
    if (r) settings.setData(r);
    return !!r;
  };
  return {
    prices: prices.data ?? [], settings: settings.data, updatePrice, savingPrice: savePrice.loading, priceError: savePrice.error,
    updateSettings, savingSettings: saveSettings.loading, settingsError: saveSettings.error,
  };
}
