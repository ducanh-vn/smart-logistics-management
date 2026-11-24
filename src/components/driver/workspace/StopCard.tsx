"use client";
import type { DriverStop } from "@/types/driver";
import { navigationUrl } from "@/constants/delivery";
import { formatVnd } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";

interface Props {
  stop: DriverStop;
  isNext: boolean;
  canAct: boolean;
  onDeliver: () => void;
  onFail: () => void;
}

const time = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "–");

/** One delivery point (TC32): receiver, address, items, navigation (TC33) and actions. */
export function StopCard({ stop, isNext, canAct, onDeliver, onFail }: Props) {
  const finished = !!stop.doneAt;
  return (
    <li className={`rounded-2xl bg-white p-4 shadow-sm ${isNext ? "ring-2 ring-[var(--brand)]" : ""} ${finished ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isNext ? "bg-[var(--brand)] text-white" : "bg-slate-100"}`}>{stop.seq}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{stop.receiverName}</span>
            <StatusBadge status={stop.orderStatus} />
          </div>
          <p className="text-sm text-slate-700">{stop.address}, {stop.district}</p>
          <p className="text-xs text-slate-500">{stop.orderCode} · {stop.weightKg} kg · dự kiến {time(stop.eta)}</p>
          <p className="text-xs text-slate-500">{stop.items}</p>
          <p className="text-xs text-slate-500">Cước: {formatVnd(stop.fee)} (người gửi trả)</p>
          {stop.failReason && <p className="mt-1 text-xs text-rose-600">Không giao được: {stop.failReason}</p>}
        </div>
      </div>
      {!finished && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <a href={navigationUrl(stop.lat, stop.lng)} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 py-2 text-center font-medium">Dẫn đường</a>
          <a href={`tel:${stop.receiverPhone}`} className="rounded-lg border border-slate-300 py-2 text-center font-medium">Gọi {stop.receiverPhone}</a>
          {canAct && (
            <>
              <button onClick={onDeliver} className="rounded-lg bg-emerald-600 py-2.5 font-semibold text-white">Giao hàng</button>
              <button onClick={onFail} className="rounded-lg bg-rose-50 py-2.5 font-semibold text-rose-700">Không giao được</button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
