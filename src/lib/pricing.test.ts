import { describe, expect, it } from "vitest";
import { calculateFee } from "./pricing";
import { DEFAULT_PRICE_RULES } from "@/constants/pricing";

describe("calculateFee (BR01)", () => {
  it("TC13: urban 12 kg = 30.000 + 7 x 5.000 = 65.000", () => {
    expect(calculateFee(12, "URBAN", DEFAULT_PRICE_RULES)).toBe(65_000);
  });
  it("charges only the base fee up to the included weight", () => {
    expect(calculateFee(5, "URBAN", DEFAULT_PRICE_RULES)).toBe(30_000);
  });
  it("charges every started kg above the included weight", () => {
    expect(calculateFee(5.2, "SUBURBAN", DEFAULT_PRICE_RULES)).toBe(45_000 + 7_000);
  });
  it("rejects non-positive weight", () => {
    expect(() => calculateFee(0, "URBAN", DEFAULT_PRICE_RULES)).toThrow();
  });
});
