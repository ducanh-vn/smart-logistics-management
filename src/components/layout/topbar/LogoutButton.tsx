"use client";
import { useRouter } from "next/navigation";
import { vi } from "@/constants/i18n/vi";

export function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };
  return (
    <button onClick={logout} className="rounded-lg border border-white/30 px-3 py-1 text-xs hover:bg-white/10">
      {vi.common.logout}
    </button>
  );
}
