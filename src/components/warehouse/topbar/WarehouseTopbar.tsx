"use client";
import type { WarehouseRef } from "@/types/meta";
import { WAREHOUSE_TABS, type WarehouseTab } from "@/constants/warehouse";
import { SelectField } from "@/components/common/SelectField";

interface Props {
  warehouses: WarehouseRef[];
  warehouseId: number | null;
  onWarehouse: (id: number) => void;
  tab: WarehouseTab;
  onTab: (t: WarehouseTab) => void;
  canEdit: boolean;
}

export function WarehouseTopbar({ warehouses, warehouseId, onWarehouse, tab, onTab, canEdit }: Props) {
  const tabs = WAREHOUSE_TABS.filter((t) => canEdit || !t.needsEdit);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-2">
      <SelectField
        className="w-56"
        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        value={warehouseId ?? ""}
        onChange={(e) => onWarehouse(Number(e.target.value))}
      />
      <nav className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === t.key ? "bg-[var(--brand)] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
