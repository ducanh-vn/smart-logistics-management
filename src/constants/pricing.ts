import type { PriceRule, Zone } from "@/types/order";

/** Default price table (BR01). Urban values match test case TC13. */
export const DEFAULT_PRICE_RULES: PriceRule[] = [
  { zone: "URBAN", baseFee: 30_000, includedKg: 5, perKgFee: 5_000 },
  { zone: "SUBURBAN", baseFee: 45_000, includedKg: 5, perKgFee: 7_000 },
  { zone: "INTERPROVINCE", baseFee: 80_000, includedKg: 5, perKgFee: 10_000 },
];

export const ZONE_LABELS: Record<Zone, string> = {
  URBAN: "Nội thành",
  SUBURBAN: "Ngoại thành",
  INTERPROVINCE: "Liên tỉnh",
};
