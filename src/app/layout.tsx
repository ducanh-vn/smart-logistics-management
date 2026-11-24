import type { Metadata } from "next";
import "./globals.css";
import { vi } from "@/constants/i18n/vi";

export const metadata: Metadata = {
  title: vi.appName,
  description: "Demo Phần mềm Quản Lý Logistics Thông Minh – Nhóm 4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
