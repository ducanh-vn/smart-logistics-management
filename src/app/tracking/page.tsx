"use client";
import Link from "next/link";
import { useTracking } from "@/hooks/useTracking";
import { vi } from "@/constants/i18n/vi";
import { TrackingForm } from "@/components/tracking/TrackingForm";
import { TrackingResultView } from "@/components/tracking/TrackingResultView";

/** UC15 – public order tracking portal (no login). */
export default function TrackingPage() {
  const t = useTracking();
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[var(--brand)] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div><p className="text-xs opacity-80">{vi.company}</p><h1 className="text-lg font-semibold">Tra cứu đơn hàng</h1></div>
          <Link href="/" className="text-sm underline opacity-90">Trang chủ</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <TrackingForm onSearch={t.search} loading={t.loading} />
        {t.error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{t.error}</p>}
        {t.result && <TrackingResultView r={t.result} />}
      </main>
    </div>
  );
}
