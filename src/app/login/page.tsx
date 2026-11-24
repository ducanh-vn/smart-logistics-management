import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { isDemoMode } from "@/lib/demo";

export default function LoginPage() {
  return (
    <AuthCard title="Đăng nhập" note={isDemoMode() ? "Tài khoản chạy thử: dieuphoi01, thukho01, taixe01, quanly01, admin – mật khẩu Slms@2026" : undefined}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
