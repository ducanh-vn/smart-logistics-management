"use client";
import { useState } from "react";
import type { OtpSendResult } from "@/types/driver";
import { useMutation } from "./useMutation";

/** FR24/FR25 – OTP, confirm delivery and report failure for one stop. */
export function useStopActions(stopId: number | null, onDone: () => void) {
  const otpCall = useMutation<Record<string, never>, OtpSendResult>("", "POST");
  const deliverCall = useMutation<{ otp: string; photo: string; lat?: number; lng?: number }>("", "POST");
  const failCall = useMutation<{ reason: string; photo: string }, { status: string }>("", "POST");
  const [otpInfo, setOtpInfo] = useState<OtpSendResult | null>(null);

  const base = `/api/driver/stops/${stopId}`;
  const sendOtp = async () => { const r = await otpCall.run({}, `${base}/otp`); if (r) setOtpInfo(r); };
  const deliver = async (otp: string, photo: string, fix: { lat: number; lng: number } | null) => {
    if (await deliverCall.run({ otp, photo, ...(fix ?? {}) }, `${base}/deliver`)) { setOtpInfo(null); onDone(); }
  };
  const fail = async (reason: string, photo: string) => {
    const r = await failCall.run({ reason, photo }, `${base}/fail`);
    if (r) onDone();
    return r;
  };
  const reset = () => { setOtpInfo(null); otpCall.setError(null); deliverCall.setError(null); failCall.setError(null); };

  return {
    otpInfo, sendOtp, sendingOtp: otpCall.loading, deliver, delivering: deliverCall.loading, fail, failing: failCall.loading,
    error: otpCall.error ?? deliverCall.error ?? failCall.error, reset,
  };
}
