import type { StockDocDetail } from "@/types/warehouse";
import { DOC_TYPE_LABELS } from "@/constants/warehouse";
import { vi } from "@/constants/i18n/vi";
import { formatDateTime } from "@/lib/format";

const SIGNERS: Record<StockDocDetail["type"], string[]> = {
  RECEIPT: ["Người giao hàng", "Thủ kho", "Kế toán"],
  ISSUE: ["Người lập phiếu", "Thủ kho", "Tài xế nhận hàng"],
  STOCKTAKE: ["Người kiểm kê", "Thủ kho", "Người duyệt"],
};

/** FR12 / TC21 – company-template slip: header with logo, slip number, line list and signature blocks. */
export function StockDocPrint({ doc }: { doc: StockDocDetail }) {
  const total = doc.lines.reduce((s, l) => s + l.quantity, 0);
  const qtyLabel = doc.type === "STOCKTAKE" ? "Chênh lệch" : "Số lượng";
  return (
    <article className="mx-auto max-w-[800px] bg-white p-10 text-[13px] text-black">
      <header className="flex items-start justify-between border-b-2 border-black pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#1f3864] text-lg font-bold text-white">SL</div>
          <div>
            <p className="font-bold">{vi.company.toUpperCase()}</p>
            <p>{doc.warehouse.name}</p>
            <p className="text-xs">{doc.warehouse.address}</p>
          </div>
        </div>
        <div className="text-right">
          <p>Số phiếu: <b className="font-mono">{doc.code}</b></p>
          <p>Ngày lập: {formatDateTime(doc.createdAt)}</p>
          {doc.tripCode && <p>Chuyến xe: <b className="font-mono">{doc.tripCode}</b></p>}
        </div>
      </header>
      <h1 className="my-5 text-center text-xl font-bold uppercase">{DOC_TYPE_LABELS[doc.type]}</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {["STT", "Mã vạch", "Tên hàng", "Vị trí", qtyLabel].map((h) => <th key={h} className="border border-black px-2 py-1.5">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((l, i) => (
            <tr key={l.id}>
              <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
              <td className="border border-black px-2 py-1 font-mono">{l.barcode}</td>
              <td className="border border-black px-2 py-1">{l.name}</td>
              <td className="border border-black px-2 py-1 text-center font-mono">{l.locationCode ?? ""}</td>
              <td className="border border-black px-2 py-1 text-right">{l.quantity}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={4} className="border border-black px-2 py-1 text-right">Tổng cộng</td>
            <td className="border border-black px-2 py-1 text-right">{total}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3">Người lập phiếu: {doc.createdBy}</p>
      <div className="mt-8 grid grid-cols-3 text-center">
        {SIGNERS[doc.type].map((s) => (
          <div key={s}>
            <p className="font-bold">{s}</p>
            <p className="text-xs italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-20" />
          </div>
        ))}
      </div>
    </article>
  );
}
