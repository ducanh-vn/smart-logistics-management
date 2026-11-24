import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth/currentUser";
import { DriverScreen } from "@/components/driver/DriverScreen";

export const metadata = { title: "SLMS – App tài xế" };

export default async function DriverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/driver");
  return <DriverScreen name={user.fullName} />;
}
