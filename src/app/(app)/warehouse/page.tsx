import { getCurrentUser } from "@/services/auth/currentUser";
import { canAccess } from "@/lib/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { WarehouseScreen } from "@/components/warehouse/WarehouseScreen";

export default async function WarehousePage() {
  const user = await getCurrentUser();
  const canEdit = !!user && canAccess(user.role, "warehouse", "FULL");
  return (
    <>
      <PageHeader title="Quản lý kho bãi" subtitle="Tồn kho theo vị trí, nhập, xuất theo chuyến, kiểm kê và chứng từ" />
      <WarehouseScreen canEdit={canEdit} />
    </>
  );
}
