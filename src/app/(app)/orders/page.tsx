import { getCurrentUser } from "@/services/auth/currentUser";
import { canAccess } from "@/lib/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { OrdersScreen } from "@/components/orders/OrdersScreen";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const canEdit = !!user && canAccess(user.role, "orders", "FULL");
  return (
    <>
      <PageHeader title="Quản lý đơn hàng" subtitle="Tạo đơn, nhập từ Excel, duyệt và theo dõi trạng thái" />
      <OrdersScreen canEdit={canEdit} />
    </>
  );
}
