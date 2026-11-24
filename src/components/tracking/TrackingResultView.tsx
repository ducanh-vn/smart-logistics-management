"use client";
import dynamic from "next/dynamic";
import type { TrackingResult } from "@/types/driver";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import { formatDate, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";

const TrackingMiniMap = dynamic(() => import("./TrackingMiniMap"), { ssr: false });

const STEPS: OrderStatus[] = ["PENDING", "APPROVED", "ASSIGNED", "DELIVERING", "DELIVERED"];

/** Status steps, ETA, live truck position, history and the SMS the receiver got (TC37, TC38). */
export function TrackingResultView({ r }: { r: TrackingResult }) {
  const reached = new Set(r.history.map((h) => h.status));
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-lg font-bold">{r.code}</span>
          <StatusBadge status={r.status} />
        </div>
        <p className="mt-1 text-sm text-slate-600">Người nhận {r.receiverName} · {r.district} · giao dự kiến ngày {formatDate(r.expectedDate)}</p>
        {r.eta && <p className="mt-2 rounded-lg bg-[var(--brand-light)] px-3 py-2 text-sm">Xe {r.plate} dự kiến đến lúc <b>{new Date(r.eta).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</b></p>}
        <ol className="mt-4 grid grid-cols-5 gap-1 text-center text-[11px]">
          {STEPS.map((s) => (
            <li key={s} className={`rounded-lg px-1 py-2 ${reached.has(s) ? "bg-[var(--brand)] text-white" : "bg-slate-100 text-slate-500"}`}>{ORDER_STATUS_LABELS[s]}</li>
          ))}
        </ol>
      </section>
      {r.vehicle && <TrackingMiniMap vehicle={r.vehicle} destination={r.destination} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold">Lịch sử</h2>
          <ul className="space-y-2 text-sm">
            {r.history.map((h, i) => (
              <li key={i}><StatusBadge status={h.status} /> <span className="text-xs text-slate-500">{formatDateTime(h.at)}</span>{h.note && <span className="block text-xs text-slate-600">{h.note}</span>}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-semibold">Tin nhắn SMS đã gửi</h2>
          <p className="mb-2 text-xs text-slate-500">Bản chạy thử không gửi SMS thật, tin nhắn hiện ở đây thay cho điện thoại người nhận.</p>
          <ul className="space-y-2 text-sm">
            {r.sms.map((m, i) => <li key={i} className="rounded-lg bg-slate-100 px-3 py-2">{m.content}<span className="block text-[11px] text-slate-500">{formatDateTime(m.at)}</span></li>)}
            {!r.sms.length && <li className="text-slate-400">Chưa có tin nhắn</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
