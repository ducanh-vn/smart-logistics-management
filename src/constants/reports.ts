/** Operating cost per km by truck type (fuel + tyres + depreciation), used for FR29. Demo assumption. */
export const COST_PER_KM: Record<string, number> = {
  "Tải 1 tấn": 6_000,
  "Tải 1,5 tấn": 7_500,
  "Tải 2,5 tấn": 9_500,
};
export const DEFAULT_COST_PER_KM = 7_500;

/** Chart colours: categorical slots 1–2 of the validated reference palette (blue, orange). */
export const CHART = {
  series1: "#2a78d6",
  series2: "#eb6834",
  grid: "#e5e7eb",
  axis: "#6b7280",
  text: "#374151",
};

export const TREND_DAYS = 7;
export const REPORT_MAX_DAYS = 31;
