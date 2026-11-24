import { getCurrentUser } from "@/services/auth/currentUser";
import { canAccess } from "@/lib/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { FleetScreen } from "@/components/fleet/FleetScreen";

export default async function FleetPage() {
  const user = await getCurrentUser();
  const canEdit = !!user && canAccess(user.role, "fleet", "FULL");
  return (
    <>
      <PageHeader title="Quản lý phương tiện" subtitle="Hồ sơ xe, lịch bảo dưỡng, tài xế và ca làm việc" />
      <FleetScreen canEdit={canEdit} />
    </>
  );
}
