import { LogoutButton } from "@/components/layout/topbar/LogoutButton";

export function DriverHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-[500] flex items-center justify-between bg-[var(--brand)] px-4 py-3 text-white">
      <div>
        <p className="text-xs opacity-80">SLMS · App tài xế</p>
        <p className="font-semibold">{name}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
