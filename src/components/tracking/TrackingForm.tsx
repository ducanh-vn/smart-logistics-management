"use client";
import { useState } from "react";
import { Button } from "@/components/common/Button";

export function TrackingForm({ onSearch, loading }: { onSearch: (code: string, phone: string) => void; loading: boolean }) {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(code, phone); }} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Mã đơn, ví dụ DH2611230001" className="rounded-lg border border-slate-300 px-3 py-2.5 font-mono" required />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="SĐT người nhận" className="rounded-lg border border-slate-300 px-3 py-2.5" required />
      <Button type="submit" loading={loading} className="py-2.5">Tra cứu</Button>
    </form>
  );
}
