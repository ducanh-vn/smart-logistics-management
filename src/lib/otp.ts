import { OTP_LENGTH, OTP_TTL_MINUTES } from "@/constants/business";

/** BR05 – 6-digit OTP. `rand` returns a number in [0, 1). */
export function generateOtp(rand: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) code += Math.floor(rand() * 10);
  return code;
}

/** BR05 – OTP is valid for 30 minutes after it was sent. */
export const isOtpExpired = (sentAt: Date, now: Date = new Date()): boolean =>
  now.getTime() - sentAt.getTime() > OTP_TTL_MINUTES * 60_000;
