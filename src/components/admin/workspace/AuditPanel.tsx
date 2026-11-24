"use client";
import { useState } from "react";
import { useAudit } from "@/hooks/useAudit";
import { AUDIT_ACTION_LABELS } from "@/constants/admin";
import { formatDateTime } from "@/lib/format";
import { Pagination } from "@/components/common/Pagination";

const pretty = (s: string | null) => {
  if (!s) return "";
  try { return JSON.stringify(JSON.parse(s)); } catch { return s; }
};

/** FR33 / TC42 – who changed what, when, with old and new values. */
export function AuditPanel() {
  const { data, loading, filters, update } = useAudit();
  const [q, setQ] = useState("");
  return (
    <div>
      <form className="mb-3 flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); update({ q }); }}>
        <select value={filters.entity} onChange={(e) => update({ entity: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Mọi đối tượng</option>
          {(data?.entities ?? []).map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã đối tượng hoặc người thực hiện" className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">Lọc</button>
        {loading && <span className="text-sm text-slate-400">Đang tải…</span>}
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="w-36 px-3 py-2">Thời điểm</th><th className="w-28">Người</th><th className="w-24">Thao tác</th><th className="w-44">Đối tượng</th><th>Giá trị cũ</th><th className="px-3">Giá trị mới</th></tr>
          </thead>
          <tbody className="divide-y align-top">
            {(data?.items ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-1.5 text-slate-500">{formatDateTime(r.at)}</td>
                <td className="font-mono">{r.username ?? "–"}</td>
                <td>{AUDIT_ACTION_LABELS[r.action] ?? r.action}</td>
                <td className="truncate" title={`${r.entity} ${r.entityId}`}>{r.entity} <span className="font-mono text-xs">{r.entityId}</span></td>
                <td className="break-all font-mono text-xs text-slate-500">{pretty(r.oldValue)}</td>
                <td className="break-all px-3 font-mono text-xs">{pretty(r.newValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={data.page} size={data.size} total={data.total} onChange={(page) => update({ page })} />}
    </div>
  );
}
