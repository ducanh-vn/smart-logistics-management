import { describe, expect, it } from "vitest";
import { generateOtp, isOtpExpired } from "./otp";

describe("OTP (BR05)", () => {
  it("has 6 digits", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });
  it("TC35: expires after 30 minutes", () => {
    const sent = new Date("2026-07-20T08:00:00");
    expect(isOtpExpired(sent, new Date("2026-07-20T08:29:00"))).toBe(false);
    expect(isOtpExpired(sent, new Date("2026-07-20T08:31:00"))).toBe(true);
  });
});
