import { PageHeader } from "@/components/common/PageHeader";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Báo cáo hiệu suất" subtitle="Quãng đường, tải trọng sử dụng và chi phí theo xe" />
      <ReportsScreen />
    </>
  );
}
