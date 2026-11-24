"use client";
import { useState } from "react";
import { useMeta } from "@/hooks/useMeta";
import type { WarehouseTab } from "@/constants/warehouse";
import { WarehouseTopbar } from "./topbar/WarehouseTopbar";
import { StockPanel } from "./workspace/StockPanel";
import { DocumentsPanel } from "./workspace/DocumentsPanel";
import { ReceiptForm } from "./sidebar/ReceiptForm";
import { IssueForm } from "./sidebar/IssueForm";
import { StocktakeForm } from "./sidebar/StocktakeForm";

interface TabProps {
  warehouseId: number;
  canEdit: boolean;
  onSaved: () => void;
}

/** Dispatcher: one component per tab. */
const TAB_VIEWS: Record<WarehouseTab, (p: TabProps) => React.ReactNode> = {
  stock: ({ warehouseId }) => <StockPanel warehouseId={warehouseId} />,
  receipt: ({ warehouseId, onSaved }) => <ReceiptForm warehouseId={warehouseId} onSaved={onSaved} />,
  issue: ({ warehouseId, onSaved }) => <IssueForm warehouseId={warehouseId} onSaved={onSaved} />,
  stocktake: ({ warehouseId, onSaved }) => <StocktakeForm warehouseId={warehouseId} onSaved={onSaved} />,
  documents: ({ warehouseId, canEdit }) => <DocumentsPanel warehouseId={warehouseId} canEdit={canEdit} />,
};

const CARD_TABS: WarehouseTab[] = ["receipt", "issue", "stocktake"];

export function WarehouseScreen({ canEdit }: { canEdit: boolean }) {
  const { warehouses } = useMeta();
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useState<WarehouseTab>("stock");
  const warehouseId = picked ?? warehouses[0]?.id ?? null;

  return (
    <>
      <WarehouseTopbar warehouses={warehouses} warehouseId={warehouseId} onWarehouse={setPicked} tab={tab} onTab={setTab} canEdit={canEdit} />
      {warehouseId && (
        <div key={`${warehouseId}-${tab}`} className={CARD_TABS.includes(tab) ? "max-w-4xl rounded-xl border bg-white p-4" : ""}>
          {TAB_VIEWS[tab]({ warehouseId, canEdit, onSaved: () => undefined })}
        </div>
      )}
    </>
  );
}
