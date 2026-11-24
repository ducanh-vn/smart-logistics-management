import type { OrderSummary } from "@/types/order";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, formatNumber, formatVnd } from "@/lib/format";
import { ZONE_LABELS } from "@/constants/pricing";

interface Props {
  items: OrderSummary[];
  selected: number[];
  canEdit: boolean;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onOpen: (id: number) => void;
}

export function OrdersTable({ items, selected, canEdit, onToggle, onToggleAll, onOpen }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-[var(--brand-light)] text-left text-xs uppercase text-slate-600">
          <tr>
            {canEdit && <th className="w-8 px-3 py-2"><input type="checkbox" checked={items.length > 0 && selected.length === items.length} onChange={onToggleAll} aria-label="Chọn tất cả" /></th>}
            <th className="px-3 py-2">Mã đơn</th>
            <th className="px-3 py-2">Người nhận</th>
            <th className="px-3 py-2">Khu vực</th>
            <th className="px-3 py-2 text-right">KL (kg)</th>
            <th className="px-3 py-2 text-right">Cước</th>
            <th className="px-3 py-2">Kho</th>
            <th className="px-3 py-2">Trạng thái</th>
            <th className="px-3 py-2">Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpen(o.id)}>
              {canEdit && (
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} aria-label={`Chọn ${o.code}`} />
                </td>
              )}
              <td className="px-3 py-2 font-mono text-xs font-semibold text-[var(--brand)]">{o.code}</td>
              <td className="px-3 py-2">{o.receiverName}<div className="text-xs text-slate-500">{o.receiverPhone}</div></td>
              <td className="px-3 py-2">{o.district}<div className="text-xs text-slate-500">{ZONE_LABELS[o.zone]}</div></td>
              <td className="px-3 py-2 text-right">{formatNumber(o.weightKg, 1)}</td>
              <td className="px-3 py-2 text-right">{formatVnd(o.fee)}</td>
              <td className="px-3 py-2">{o.warehouseCode}</td>
              <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
              <td className="px-3 py-2 text-xs text-slate-500">{formatDateTime(o.createdAt)}</td>
            </tr>
          ))}
          {!items.length && (
            <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">Không có đơn hàng</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
