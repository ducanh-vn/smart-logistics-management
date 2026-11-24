"use client";
import { useEffect, useState } from "react";
import type { NewUserInput } from "@/types/admin";
import type { Role } from "@/types/auth";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { Modal } from "@/components/common/Modal";
import { FormField } from "@/components/common/FormField";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/common/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: NewUserInput) => Promise<boolean>;
  saving: boolean;
  error: string | null;
}

const EMPTY: NewUserInput = { username: "", fullName: "", role: "STOREKEEPER", password: "" };

/** TC12 – create an account; the user must change the temporary password at first login. */
export function NewUserModal({ isOpen, onClose, onSubmit, saving, error }: Props) {
  const [form, setForm] = useState<NewUserInput>(EMPTY);
  useEffect(() => { if (isOpen) setForm(EMPTY); }, [isOpen]);
  const set = (k: keyof NewUserInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo người dùng">
      <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (await onSubmit(form)) onClose(); }}>
        <FormField label="Tên đăng nhập" name="username" value={form.username} onChange={set("username")} placeholder="vd. tk01" />
        <FormField label="Họ tên" name="fullName" value={form.fullName} onChange={set("fullName")} />
        <SelectField label="Vai trò" options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r as Role] }))} value={form.role} onChange={set("role")} />
        <FormField label="Mật khẩu tạm" name="password" type="text" value={form.password} onChange={set("password")} placeholder="Tối thiểu 8 ký tự, có chữ và số" />
        <p className="text-xs text-slate-500">Người dùng phải đổi mật khẩu ở lần đăng nhập đầu tiên. Tài khoản tài xế cần gắn hồ sơ tài xế mới dùng được app.</p>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          <Button type="submit" loading={saving}>Tạo</Button>
        </div>
      </form>
    </Modal>
  );
}
