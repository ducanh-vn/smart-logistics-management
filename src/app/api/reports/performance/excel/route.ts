import { requireAccess } from "@/services/auth/guard";
import { getPerformance, parseRange } from "@/services/reports/performance";
import { performanceWorkbook } from "@/services/reports/exportExcel";

export async function GET(req: Request) {
  const g = await requireAccess("reports");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  const { from, to } = parseRange(p.get("from"), p.get("to"));
  const buf = await performanceWorkbook(await getPerformance(from, to));
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bao-cao-hieu-suat.xlsx"`,
    },
  });
}
