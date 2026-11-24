import { getCurrentUser } from "@/services/auth/currentUser";
import { canAccess } from "@/lib/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const canEdit = !!user && canAccess(user.role, "admin", "FULL");
  return (
    <>
      <PageHeader title="Quản trị hệ thống" subtitle="Người dùng và phân quyền, bảng giá cước, tham số, nhật ký thao tác" />
      <AdminScreen canEdit={canEdit} />
    </>
  );
}
