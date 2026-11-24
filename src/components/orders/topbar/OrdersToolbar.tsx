"use client";
import { useState } from "react";
import type { OrderListFilters } from "@/hooks/useOrders";
import type { WarehouseRef } from "@/types/meta";
import { ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/common/Button";

interface Props {
  filters: OrderListFilters;
  warehouses: WarehouseRef[];
  onChange: (patch: Partial<OrderListFilters>) => void;
  canEdit: boolean;
  selectedCount: number;
  onCreate: () => void;
  onImport: () => void;
  onApprove: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function OrdersToolbar({ filters, warehouses, onChange, canEdit, selectedCount, onCreate, onImport, onApprove, onCancel }: Props) {
  const [q, setQ] = useState(filters.q);
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <form onSubmit={(e) => { e.preventDefault(); onChange({ q }); }} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã đơn, người nhận, SĐT, khu vực" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <Button type="submit" variant="secondary">Tìm</Button>
      </form>
      <SelectField className="w-40" placeholder="Mọi trạng thái" options={STATUS_OPTIONS} value={filters.status} onChange={(e) => onChange({ status: e.target.value as OrderListFilters["status"] })} />
      <SelectField className="w-48" placeholder="Mọi kho" options={warehouses.map((w) => ({ value: w.id, label: w.name }))} value={filters.warehouseId} onChange={(e) => onChange({ warehouseId: e.target.value })} />
      {canEdit && (
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="success" disabled={!selectedCount} onClick={onApprove}>Duyệt ({selectedCount})</Button>
          <Button variant="danger" disabled={!selectedCount} onClick={onCancel}>Hủy đơn</Button>
          <Button variant="secondary" onClick={onImport}>Nhập Excel</Button>
          <Button onClick={onCreate}>+ Tạo đơn</Button>
        </div>
      )}
    </div>
  );
}
