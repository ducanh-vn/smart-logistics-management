"use client";
import { useState } from "react";
import type { VehicleRow } from "@/types/fleet";
import { FLEET_TABS, type FleetTab } from "@/constants/fleet";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { Tabs } from "@/components/common/Tabs";
import { Button } from "@/components/common/Button";
import { VehiclesTable } from "./workspace/VehiclesTable";
import { MaintenancePanel } from "./workspace/MaintenancePanel";
import { DriversTable } from "./workspace/DriversTable";
import { VehicleModal } from "./modals/VehicleModal";

/** Fleet orchestrator: vehicles, maintenance and drivers tabs (UC09). */
export function FleetScreen({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<FleetTab>("vehicles");
  const v = useVehicles();
  const d = useDrivers();
  const [editing, setEditing] = useState<VehicleRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const due = v.vehicles.filter((x) => x.maintenance !== "OK").length;

  const open = (vehicle: VehicleRow | null) => { setEditing(vehicle); setModalOpen(true); };

  const views: Record<FleetTab, React.ReactNode> = {
    vehicles: <VehiclesTable vehicles={v.vehicles} canEdit={canEdit} onEdit={open} />,
    maintenance: <MaintenancePanel vehicles={v.vehicles} canEdit={canEdit} busy={v.busy} error={v.error} onAction={v.maintenance} />,
    drivers: <DriversTable drivers={d.drivers} canEdit={canEdit} error={d.error} onShift={d.setShift} />,
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-2">
        <Tabs tabs={FLEET_TABS.map((t) => (t.key === "maintenance" && due ? { ...t, label: `${t.label} (${due})` } : t))} active={tab} onChange={setTab} />
        {canEdit && tab === "vehicles" && <Button className="ml-auto" onClick={() => open(null)}>+ Thêm xe</Button>}
      </div>
      {views[tab]}
      <VehicleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} vehicle={editing} onSaved={() => { setModalOpen(false); v.reload(); }} />
    </>
  );
}
