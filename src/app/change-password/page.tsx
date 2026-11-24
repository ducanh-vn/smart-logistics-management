import { AuthCard } from "@/components/auth/AuthCard";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <AuthCard title="Đổi mật khẩu" note="Bạn cần đổi mật khẩu trước khi sử dụng hệ thống (FR31).">
      <ChangePasswordForm />
    </AuthCard>
  );
}
