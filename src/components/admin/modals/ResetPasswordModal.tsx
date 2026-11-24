"use client";
import { useEffect, useState } from "react";
import type { UserRow } from "@/types/admin";
import { Modal } from "@/components/common/Modal";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/common/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserRow | null;
  onSubmit: (password: string) => Promise<boolean>;
  error: string | null;
}

export function ResetPasswordModal({ isOpen, onClose, user, onSubmit, error }: Props) {
  const [pw, setPw] = useState("");
  useEffect(() => { if (isOpen) setPw(""); }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đặt lại mật khẩu ${user?.username ?? ""}`}>
      <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (await onSubmit(pw)) onClose(); }}>
        <FormField label="Mật khẩu tạm mới" name="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <p className="text-xs text-slate-500">Người dùng phải đổi mật khẩu khi đăng nhập lại.</p>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}
