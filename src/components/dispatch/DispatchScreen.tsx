"use client";
import { useState } from "react";
import { useMeta } from "@/hooks/useMeta";
import { DISPATCH_TABS, type DispatchTab } from "@/constants/dispatch";
import { Tabs } from "@/components/common/Tabs";
import { SelectField } from "@/components/common/SelectField";
import { PlanView } from "./PlanView";
import { TrackingView } from "./TrackingView";

/** Dispatch orchestrator: warehouse picker and plan / tracking tabs. */
export function DispatchScreen({ canEdit }: { canEdit: boolean }) {
  const { warehouses } = useMeta();
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useState<DispatchTab>("plan");
  const warehouse = warehouses.find((w) => w.id === picked) ?? warehouses[0];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-2">
        <SelectField className="w-56" options={warehouses.map((w) => ({ value: w.id, label: w.name }))} value={warehouse?.id ?? ""} onChange={(e) => setPicked(Number(e.target.value))} />
        <Tabs tabs={DISPATCH_TABS} active={tab} onChange={setTab} />
      </div>
      {warehouse && (tab === "plan" ? <PlanView key={warehouse.id} warehouse={warehouse} canEdit={canEdit} /> : <TrackingView key={warehouse.id} warehouse={warehouse} canEdit={canEdit} />)}
    </>
  );
}
