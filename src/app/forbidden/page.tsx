import Link from "next/link";
import { vi } from "@/constants/i18n/vi";

export default async function ForbiddenPage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  const { home = "/" } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-[var(--brand)]">403</p>
      <p className="text-slate-700">{vi.errors.forbidden}</p>
      <Link href={home} className="text-sm text-[var(--brand)] underline">Về trang chính</Link>
    </main>
  );
}
