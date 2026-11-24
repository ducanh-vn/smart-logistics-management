import { notFound } from "next/navigation";
import { getDocument } from "@/services/warehouse/queries";
import { StockDocPrint } from "@/components/warehouse/print/StockDocPrint";
import { PrintButton } from "@/components/warehouse/print/PrintButton";

/** Print view outside the app shell; access is checked by middleware ("/print" → warehouse). */
export default async function PrintStockDocPage({ params }: { params: Promise<{ id: string }> }) {
  const doc = await getDocument(Number((await params).id));
  if (!doc) notFound();
  return (
    <main className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[800px] justify-end print:hidden"><PrintButton /></div>
      <StockDocPrint doc={doc} />
    </main>
  );
}
