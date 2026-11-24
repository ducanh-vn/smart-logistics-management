import Link from "next/link";
import type { SessionUser } from "@/types/auth";
import { ROLE_LABELS } from "@/constants/roles";
import { vi } from "@/constants/i18n/vi";
import { LogoutButton } from "./LogoutButton";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="flex items-center justify-between gap-3 bg-[var(--brand)] px-4 py-3 text-white">
      <Link href="/" className="font-semibold">{vi.appShort} <span className="hidden font-normal opacity-80 sm:inline">– {vi.company}</span></Link>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">{user.fullName} · <span className="opacity-80">{ROLE_LABELS[user.role]}</span></span>
        <LogoutButton />
      </div>
    </header>
  );
}
