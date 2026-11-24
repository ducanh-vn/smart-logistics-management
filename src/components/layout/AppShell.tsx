import type { SessionUser } from "@/types/auth";
import { Topbar } from "./topbar/Topbar";
import { Sidebar } from "./sidebar/Sidebar";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="print:hidden"><Topbar user={user} /></div>
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="print:hidden"><Sidebar role={user.role} /></div>
        <main className="min-w-0 flex-1 p-4 md:p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
