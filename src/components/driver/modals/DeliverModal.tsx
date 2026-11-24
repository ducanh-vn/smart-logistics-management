"use client";
import { useEffect, useState } from "react";
import type { DriverStop } from "@/types/driver";
import { useStopActions } from "@/hooks/useStopActions";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { PhotoInput } from "./PhotoInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stop: DriverStop | null;
  lastFix: () => { lat: number; lng: number } | null;
  onDone: () => void;
}

/** UC13 – photo, OTP sent to the receiver, then confirm (BR05, TC06, TC34). */
export function DeliverModal({ isOpen, onClose, stop, lastFix, onDone }: Props) {
  const a = useStopActions(stop?.id ?? null, onDone);
  const cam = usePhotoCapture();
  const [otp, setOtp] = useState("");
  useEffect(() => { if (isOpen) { setOtp(""); cam.clear(); a.reset(); } }, [isOpen, stop?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stop) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Giao đơn ${stop.orderCode}`}>
      <div className="space-y-3">
        <p className="text-sm">Người nhận: <b>{stop.receiverName}</b> · {stop.receiverPhone}</p>
        <PhotoInput photo={cam.photo} busy={cam.busy} onFile={cam.onFile} label="Chụp ảnh hàng đã giao" />
        <Button variant="secondary" className="w-full" onClick={a.sendOtp} loading={a.sendingOtp}>
          {a.otpInfo || stop.otpSent ? "Gửi lại mã OTP" : "Gửi mã OTP cho người nhận"}
        </Button>
        {a.otpInfo && (
          <div className="rounded-lg bg-[var(--brand-light)] px-3 py-2 text-sm">
            Đã gửi SMS tới {a.otpInfo.sentTo}, hiệu lực 30 phút.
            {a.otpInfo.demoOtp && <span className="mt-1 block text-xs text-slate-600">Bản chạy thử không gửi SMS thật. Mã người nhận nhận được: <b className="font-mono text-base">{a.otpInfo.demoOtp}</b></span>}
          </div>
        )}
        <input
          value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" placeholder="Nhập mã OTP"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-center font-mono text-xl tracking-[0.4em] placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
        />
        {a.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{a.error}</p>}
        <Button variant="success" className="w-full py-3 text-base" disabled={otp.length !== 6 || !cam.photo} loading={a.delivering} onClick={() => a.deliver(otp, cam.photo!, lastFix())}>
          Xác nhận đã giao
        </Button>
      </div>
    </Modal>
  );
}
