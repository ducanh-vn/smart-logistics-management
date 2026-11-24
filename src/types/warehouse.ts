export type StockDocType = "RECEIPT" | "ISSUE" | "STOCKTAKE";
export type StockDocStatus = "DRAFT" | "PENDING" | "DONE";

export interface WarehouseInfo {
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface StockLineInput {
  barcode: string;
  name: string;
  quantity: number;
  locationCode?: string;
}

export interface StockRow {
  id: number;
  barcode: string;
  name: string;
  quantity: number;
  minQty: number;
  locationCode: string;
  isLow: boolean;
  updatedAt: string;
}

export interface IssueLineInput {
  barcode: string;
  quantity: number;
}

export interface StocktakeLineInput {
  barcode: string;
  locationCode: string;
  counted: number;
}

export interface StockDocSummary {
  id: number;
  code: string;
  type: StockDocType;
  status: StockDocStatus;
  createdBy: string;
  createdAt: string;
  tripCode: string | null;
  lineCount: number;
  totalQty: number;
}

export interface StockDocDetail extends StockDocSummary {
  warehouse: { code: string; name: string; address: string };
  lines: { id: number; barcode: string; name: string; quantity: number; locationCode: string | null }[];
}

/** Line that would push stock below zero (BR03). */
export interface ShortageError {
  barcode: string;
  requested: number;
  available: number;
}

export interface TripRef {
  id: number;
  code: string;
  plate: string;
  orderCount: number;
}
