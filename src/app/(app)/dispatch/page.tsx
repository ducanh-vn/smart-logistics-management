import { getCurrentUser } from "@/services/auth/currentUser";
import { canAccess } from "@/lib/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { DispatchScreen } from "@/components/dispatch/DispatchScreen";

export default async function DispatchPage() {
  const user = await getCurrentUser();
  const canEdit = !!user && canAccess(user.role, "dispatch", "FULL");
  return (
    <>
      <PageHeader title="Điều phối vận chuyển" subtitle="Tối ưu tuyến, phân xe, gửi lệnh cho tài xế và theo dõi xe trên bản đồ" />
      <DispatchScreen canEdit={canEdit} />
    </>
  );
}
