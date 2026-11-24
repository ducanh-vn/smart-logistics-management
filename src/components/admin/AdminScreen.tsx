"use client";
import { useState } from "react";
import { ADMIN_TABS, type AdminTab } from "@/constants/admin";
import { useAdminConfig } from "@/hooks/useAdminConfig";
import { Tabs } from "@/components/common/Tabs";
import { UsersPanel } from "./workspace/UsersPanel";
import { PricingPanel } from "./workspace/PricingPanel";
import { SettingsPanel } from "./workspace/SettingsPanel";
import { AuditPanel } from "./workspace/AuditPanel";

/** UC02 / UC18 – administration dispatcher. */
export function AdminScreen({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<AdminTab>("users");
  const c = useAdminConfig();
  const views: Record<AdminTab, React.ReactNode> = {
    users: <UsersPanel canEdit={canEdit} />,
    pricing: <PricingPanel prices={c.prices} canEdit={canEdit} onSave={c.updatePrice} saving={c.savingPrice} error={c.priceError} />,
    settings: <SettingsPanel settings={c.settings} canEdit={canEdit} onSave={c.updateSettings} saving={c.savingSettings} error={c.settingsError} />,
    audit: <AuditPanel />,
  };
  return (
    <>
      <div className="mb-4 border-b border-slate-200 pb-2"><Tabs tabs={ADMIN_TABS} active={tab} onChange={setTab} /></div>
      {views[tab]}
    </>
  );
}
