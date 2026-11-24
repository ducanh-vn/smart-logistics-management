"use client";
import { useState } from "react";
import type { DriverRow, Shift } from "@/types/fleet";
import { SHIFT_LABELS } from "@/constants/fleet";

interface Props {
  drivers: DriverRow[];
  canEdit: boolean;
  error: string | null;
  onShift: (id: number, shift: Shift) => void;
}

const SHIFT_OPTIONS = Object.entries(SHIFT_LABELS) as [Shift, string][];

/** FR15 – driver profiles, licence, shift and app account. */
export function DriversTable({ drivers, canEdit, error, onShift }: Props) {
  const [q, setQ] = useState("");
  const rows = drivers.filter((d) => `${d.code} ${d.fullName} ${d.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã, tên hoặc SĐT tài xế" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {error && <span className="text-sm text-rose-600">{error}</span>}
        <span className="ml-auto text-sm text-slate-600">{drivers.filter((d) => !d.busy).length}/{drivers.length} tài xế đang rảnh</span>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Mã</th><th>Họ tên</th><th>Điện thoại</th><th>Bằng lái</th><th>Tài khoản app</th><th>Ca làm việc</th><th className="px-3">Tình trạng</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-mono">{d.code}</td>
                <td className="font-medium">{d.fullName}</td>
                <td>{d.phone}</td>
                <td className="font-mono">{d.licenseNo}</td>
                <td className="font-mono text-slate-500">{d.username ?? "–"}</td>
                <td>
                  {canEdit ? (
                    <select className="rounded border border-slate-300 px-2 py-1" value={d.shift} onChange={(e) => onShift(d.id, e.target.value as Shift)}>
                      {SHIFT_OPTIONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  ) : SHIFT_LABELS[d.shift]}
                </td>
                <td className="px-3">{d.busy ? <span className="text-sky-700">Đang có chuyến</span> : <span className="text-emerald-700">Rảnh</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
