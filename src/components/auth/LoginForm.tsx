"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNextPath } from "@/lib/demo";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/common/Button";
import { useMutation } from "@/hooks/useMutation";

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { run, loading, error } = useMutation<{ username: string; password: string }, { redirect: string }>("/api/auth/login");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await run({ username, password });
    if (res) router.replace(res.redirect === "/change-password" ? res.redirect : next || res.redirect);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormField label="Tên đăng nhập" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <FormField label="Mật khẩu" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Đăng nhập</Button>
    </form>
  );
}
