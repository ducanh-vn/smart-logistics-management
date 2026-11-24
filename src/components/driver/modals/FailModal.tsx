"use client";
import { useEffect, useState } from "react";
import type { DriverStop } from "@/types/driver";
import { FAIL_REASONS } from "@/constants/delivery";
import { useStopActions } from "@/hooks/useStopActions";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { PhotoInput } from "./PhotoInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stop: DriverStop | null;
  onDone: () => void;
}

/** UC14 – reason + photo; the order goes to "Giao lại" or, after 2 redeliveries, "Hoàn kho" (BR06, TC36). */
export function FailModal({ isOpen, onClose, stop, onDone }: Props) {
  const a = useStopActions(stop?.id ?? null, onDone);
  const cam = usePhotoCapture();
  const [reason, setReason] = useState("");
  useEffect(() => { if (isOpen) { setReason(""); cam.clear(); a.reset(); } }, [isOpen, stop?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stop) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Không giao được ${stop.orderCode}`}>
      <div className="space-y-3">
        <div className="grid gap-2">
          {FAIL_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${reason === r ? "border-[var(--brand)] bg-[var(--brand-light)]" : "border-slate-300"}`}>
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
              {r}
            </label>
          ))}
        </div>
        <PhotoInput photo={cam.photo} busy={cam.busy} onFile={cam.onFile} label="Chụp ảnh hiện trường" />
        {a.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{a.error}</p>}
        <Button variant="danger" className="w-full py-3 text-base" disabled={!reason || !cam.photo} loading={a.failing} onClick={() => a.fail(reason, cam.photo!)}>
          Xác nhận giao không thành công
        </Button>
      </div>
    </Modal>
  );
}
