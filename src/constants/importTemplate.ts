/** Column order of the Excel import template (FR02). */
export const IMPORT_COLUMNS = [
  { key: "customerCode", header: "Mã khách hàng", example: "KH0001", width: 16 },
  { key: "receiverName", header: "Người nhận", example: "Nguyễn Văn B", width: 22 },
  { key: "receiverPhone", header: "SĐT người nhận", example: "0912345123", width: 16 },
  { key: "address", header: "Địa chỉ", example: "Số 12 Trần Thái Tông", width: 30 },
  { key: "district", header: "Khu vực (quận/huyện)", example: "Cầu Giấy", width: 20 },
  { key: "weightKg", header: "Khối lượng (kg)", example: 12, width: 14 },
] as const;

export type ImportColumnKey = (typeof IMPORT_COLUMNS)[number]["key"];
