import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  ASSIGNED: "Đã phân xe",
  DELIVERING: "Đang giao",
  DELIVERED: "Đã giao",
  RETRY: "Giao lại",
  RETURNED: "Hoàn kho",
  CANCELLED: "Đã hủy",
};

/** Allowed transitions – business rule BR02 (and BR06 for RETRY/RETURNED). */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["DELIVERING", "APPROVED"],
  DELIVERING: ["DELIVERED", "RETRY", "RETURNED"],
  RETRY: ["ASSIGNED", "RETURNED"],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

/** BR07 – orders may be edited/cancelled only before vehicle assignment. */
export const EDITABLE_STATUSES: OrderStatus[] = ["PENDING", "APPROVED"];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-sky-100 text-sky-800",
  ASSIGNED: "bg-indigo-100 text-indigo-800",
  DELIVERING: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  RETRY: "bg-orange-100 text-orange-800",
  RETURNED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-rose-100 text-rose-800",
};
