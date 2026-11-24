import type { PriceRule, Zone } from "@/types/order";

/**
 * BR01 – fee = base fee of the delivery zone + surcharge for weight above the
 * included weight (each started kg is charged).
 */
export function calculateFee(weightKg: number, zone: Zone, rules: PriceRule[]): number {
  const rule = rules.find((r) => r.zone === zone);
  if (!rule) throw new Error(`Missing price rule for zone ${zone}`);
  if (!(weightKg > 0)) throw new Error("Weight must be greater than 0");
  const extraKg = Math.max(0, Math.ceil(weightKg - rule.includedKg));
  return rule.baseFee + extraKg * rule.perKgFee;
}
