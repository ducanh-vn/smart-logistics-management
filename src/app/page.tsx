import { ModuleGrid } from "@/components/home/ModuleGrid";
import Link from "next/link";
import { vi } from "@/constants/i18n/vi";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium text-slate-500">{vi.company}</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--brand)]">{vi.appName}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Bản chạy thử phục vụ bài tập lớn môn Quản lý dự án phần mềm – Nhóm 4. Các chức năng bám theo tài liệu đặc tả
        yêu cầu (SLMS-SRS-01) và tài liệu thiết kế (SLMS-TK-01).
      </p>
      <div className="mt-5 flex gap-3">
        <Link href="/login" className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white">Đăng nhập</Link>
        <Link href="/tracking" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Tra cứu đơn hàng</Link>
      </div>
      <div className="mt-8">
        <ModuleGrid />
      </div>
    </main>
  );
}
