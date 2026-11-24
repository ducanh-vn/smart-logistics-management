"use client";
import type { OrderDetail } from "@/types/order";
import { useFetch } from "@/hooks/useFetch";
import { ZONE_LABELS } from "@/constants/pricing";
import { formatDate, formatDateTime, formatVnd } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";

interface Props {
  orderId: number | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

/** Right-side drawer: order info, items and status timeline (FR06). */
export function OrderDetailDrawer({ orderId, onClose }: Props) {
  const { data, loading, error } = useFetch<OrderDetail>(orderId ? `/api/orders/${orderId}` : null);
  if (!orderId) return null;
  const o = data && data.id === orderId ? data : null;

  return (
    <div className="fixed inset-0 z-[900] flex justify-end bg-black/30" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--brand)]">{o ? o.code : "Chi tiết đơn"}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>
        {loading && !o && <p className="text-sm text-slate-500">Đang tải…</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {o && (
          <>
            <div className="mb-3"><StatusBadge status={o.status} /></div>
            <section className="mb-4 rounded-lg border p-3">
              <Row label="Khách hàng" value={`${o.customer.code} · ${o.customer.name}`} />
              <Row label="Người nhận" value={o.receiverName} />
              <Row label="Điện thoại" value={o.receiverPhone} />
              <Row label="Địa chỉ" value={`${o.address}, ${o.district}`} />
              <Row label="Vùng" value={ZONE_LABELS[o.zone]} />
              <Row label="Kho xuất" value={o.warehouse.name} />
              <Row label="Khối lượng" value={`${o.weightKg} kg`} />
              <Row label="Cước phí" value={formatVnd(o.fee)} />
              <Row label="Ngày giao dự kiến" value={formatDate(o.expectedDate)} />
              {o.failedAttempts > 0 && <Row label="Số lần giao lỗi" value={o.failedAttempts} />}
              {o.stops.length > 0 && <Row label="Chuyến xe" value={o.stops.map((s) => `${s.trip.code} (${s.trip.vehicle.plate})`).join(", ")} />}
            </section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Hàng hóa ({o.items.length})</h3>
            <ul className="mb-4 divide-y rounded-lg border text-sm">
              {o.items.map((it) => (
                <li key={it.id} className="flex justify-between px-3 py-2">
                  <span>{it.name} <span className="text-xs text-slate-400">{it.barcode}</span></span>
                  <span>{it.quantity} × {it.weightKg} kg</span>
                </li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Lịch sử trạng thái</h3>
            <ol className="relative ml-2 border-l border-slate-200">
              {o.history.map((h) => (
                <li key={h.id} className="mb-3 ml-4">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[var(--brand)]" />
                  <div className="flex items-center gap-2"><StatusBadge status={h.status} /><span className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</span></div>
                  <p className="text-xs text-slate-600">{h.actor}{h.note ? ` · ${h.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </>
        )}
      </aside>
    </div>
  );
}
