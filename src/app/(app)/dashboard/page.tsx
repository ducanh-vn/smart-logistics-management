import { PageHeader } from "@/components/common/PageHeader";
import { DashboardScreen } from "@/components/reports/DashboardScreen";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Số đơn theo trạng thái, tỷ lệ giao đúng hẹn, xe hoạt động" />
      <DashboardScreen />
    </>
  );
}
