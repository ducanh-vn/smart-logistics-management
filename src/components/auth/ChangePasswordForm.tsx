"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/common/Button";
import { useMutation } from "@/hooks/useMutation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const { run, loading, error, setError } = useMutation<{ current: string; next: string }, { redirect: string }>("/api/auth/change-password");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) return setError("Mật khẩu nhập lại không khớp");
    const res = await run({ current: form.current, next: form.next });
    if (res) router.replace(res.redirect);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormField label="Mật khẩu hiện tại" name="current" type="password" value={form.current} onChange={set("current")} required />
      <FormField label="Mật khẩu mới (tối thiểu 8 ký tự, gồm chữ và số)" name="next" type="password" value={form.next} onChange={set("next")} required />
      <FormField label="Nhập lại mật khẩu mới" name="confirm" type="password" value={form.confirm} onChange={set("confirm")} required />
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Đổi mật khẩu</Button>
    </form>
  );
}
