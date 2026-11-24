"use client";
import { useState } from "react";
import type { DriverStop } from "@/types/driver";
import { useDriverTrips } from "@/hooks/useDriverTrips";
import { useGpsReporter } from "@/hooks/useGpsReporter";
import { DriverHeader } from "./topbar/DriverHeader";
import { TripCard } from "./workspace/TripCard";
import { StopCard } from "./workspace/StopCard";
import { DeliverModal } from "./modals/DeliverModal";
import { FailModal } from "./modals/FailModal";

type Action = { kind: "deliver" | "fail"; stop: DriverStop } | null;

/** Mobile web for drivers (UC12–UC14). */
export function DriverScreen({ name }: { name: string }) {
  const d = useDriverTrips();
  const running = d.trip?.status === "RUNNING";
  const gps = useGpsReporter(running);
  const [action, setAction] = useState<Action>(null);
  const next = d.trip?.stops.find((s) => !s.doneAt) ?? null;
  const done = () => { setAction(null); d.reload(); };

  return (
    <div className="min-h-screen bg-slate-100">
      <DriverHeader name={name} />
      <main className="mx-auto max-w-md space-y-3 p-3">
        {d.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{d.error}</p>}
        {!d.trip && <p className="rounded-2xl bg-white p-6 text-center text-slate-500">{d.loading ? "Đang tải…" : "Hôm nay bạn chưa có chuyến nào. Màn hình tự cập nhật khi có lệnh mới."}</p>}
        {d.trip && (
          <>
            <TripCard trips={d.trips} trip={d.trip} onPick={d.pick} onStart={d.start} starting={d.starting} gps={gps.state} lastSent={gps.lastSent} />
            {d.trip.status === "DONE" && <p className="rounded-2xl bg-emerald-50 p-4 text-center text-emerald-700">Đã hoàn thành chuyến. Cảm ơn bạn!</p>}
            <ol className="space-y-3">
              {d.trip.stops.map((s) => (
                <StopCard key={s.id} stop={s} isNext={s.id === next?.id} canAct={running} onDeliver={() => setAction({ kind: "deliver", stop: s })} onFail={() => setAction({ kind: "fail", stop: s })} />
              ))}
            </ol>
          </>
        )}
      </main>
      <DeliverModal isOpen={action?.kind === "deliver"} onClose={() => setAction(null)} stop={action?.stop ?? null} lastFix={gps.lastFix} onDone={done} />
      <FailModal isOpen={action?.kind === "fail"} onClose={() => setAction(null)} stop={action?.stop ?? null} onDone={done} />
    </div>
  );
}
