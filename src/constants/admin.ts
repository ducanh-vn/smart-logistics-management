import type { SettingDef } from "@/types/admin";

/** FR34 – system parameters editable by the administrator. */
export const SETTING_DEFS: SettingDef[] = [
  { key: "companyName", label: "Tên công ty", type: "text", defaultValue: "Công ty Logistics ABC" },
  { key: "dailyCapacity", label: "Năng lực xử lý (đơn/ngày)", type: "number", defaultValue: "2000" },
  { key: "defaultMinQty", label: "Mức tồn tối thiểu mặc định", type: "number", defaultValue: "10", hint: "Áp dụng cho mặt hàng mới khi nhập kho (FR11)" },
];

export type AdminTab = "users" | "pricing" | "settings" | "audit";
export const ADMIN_TABS: { key: AdminTab; label: string }[] = [
  { key: "users", label: "Người dùng" },
  { key: "pricing", label: "Bảng giá cước" },
  { key: "settings", label: "Tham số hệ thống" },
  { key: "audit", label: "Nhật ký thao tác" },
];

export const AUDIT_ACTION_LABELS: Record<string, string> = { CREATE: "Thêm", UPDATE: "Sửa", DELETE: "Xóa", LOGIN: "Đăng nhập" };
export const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;
