import type { StockDocStatus, StockDocType } from "@/types/warehouse";

export const DOC_TYPE_LABELS: Record<StockDocType, string> = {
  RECEIPT: "Phiếu nhập",
  ISSUE: "Phiếu xuất",
  STOCKTAKE: "Phiếu kiểm kê",
};

/** Prefix of the document number, e.g. PX000123. */
export const DOC_PREFIX: Record<StockDocType, string> = { RECEIPT: "PN", ISSUE: "PX", STOCKTAKE: "PK" };

export const DOC_STATUS_LABELS: Record<StockDocStatus, string> = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  DONE: "Hoàn tất",
};

export type WarehouseTab = "stock" | "receipt" | "issue" | "stocktake" | "documents";

export const WAREHOUSE_TABS: { key: WarehouseTab; label: string; needsEdit: boolean }[] = [
  { key: "stock", label: "Tồn kho", needsEdit: false },
  { key: "receipt", label: "Nhập kho", needsEdit: true },
  { key: "issue", label: "Xuất kho", needsEdit: true },
  { key: "stocktake", label: "Kiểm kê", needsEdit: true },
  { key: "documents", label: "Chứng từ", needsEdit: false },
];
