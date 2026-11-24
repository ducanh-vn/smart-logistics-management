"use client";
import { useState } from "react";
import type { UserRow } from "@/types/admin";
import type { Role } from "@/types/auth";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { formatDate } from "@/lib/format";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/common/Button";
import { NewUserModal } from "../modals/NewUserModal";
import { ResetPasswordModal } from "../modals/ResetPasswordModal";

/** FR32 – user accounts and roles. */
export function UsersPanel({ canEdit }: { canEdit: boolean }) {
  const u = useUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const rows = u.users.filter((x) => (!role || x.role === role) && `${x.username} ${x.fullName}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên đăng nhập hoặc họ tên" className="w-60 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value as Role | "")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Mọi vai trò</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <span className="text-sm text-slate-500">{rows.length} tài khoản</span>
        {u.error && <span className="text-sm text-rose-600">{u.error}</span>}
        {canEdit && <Button className="ml-auto" onClick={() => { u.setCreateError(null); setCreating(true); }}>+ Tạo người dùng</Button>}
      </div>
      <div className="max-h-[620px] overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Tên đăng nhập</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((x) => (
              <tr key={x.id} className={x.active ? "" : "bg-slate-50 text-slate-400"}>
                <td className="px-3 py-1.5 font-mono">{x.username}</td>
                <td>{x.fullName}</td>
                <td>
                  {canEdit ? (
                    <select value={x.role} onChange={(e) => u.update(x.id, { role: e.target.value as Role })} className="rounded border border-slate-300 px-2 py-1">
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  ) : ROLE_LABELS[x.role]}
                </td>
                <td className="text-xs">
                  {!x.active ? "Đã khóa" : x.locked ? <span className="text-amber-700">Tạm khóa do sai mật khẩu</span> : x.mustChangePassword ? "Chờ đổi mật khẩu" : <span className="text-emerald-700">Hoạt động</span>}
                </td>
                <td className="text-slate-500">{formatDate(x.createdAt)}</td>
                <td className="whitespace-nowrap px-3 text-right text-xs">
                  {canEdit && (
                    <span className="flex justify-end gap-3">
                      {x.locked && <button className="text-[var(--brand)] underline" onClick={() => u.update(x.id, { unlock: true })}>Mở khóa</button>}
                      <button className="text-[var(--brand)] underline" onClick={() => setResetFor(x)}>Đặt lại mật khẩu</button>
                      <button className={x.active ? "text-rose-600 underline" : "text-emerald-700 underline"} onClick={() => u.update(x.id, { active: !x.active })}>{x.active ? "Khóa" : "Kích hoạt"}</button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NewUserModal isOpen={creating} onClose={() => setCreating(false)} onSubmit={u.add} saving={u.creating} error={u.createError} />
      <ResetPasswordModal isOpen={!!resetFor} onClose={() => setResetFor(null)} user={resetFor} error={u.error} onSubmit={(pw) => u.update(resetFor!.id, { resetPassword: pw })} />
    </div>
  );
}
