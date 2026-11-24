import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { listAudit } from "@/services/admin/auditLog";

export async function GET(req: Request) {
  const g = await requireAccess("admin");
  if (g.error) return g.error;
  const p = new URL(req.url).searchParams;
  return NextResponse.json(await listAudit({ entity: p.get("entity") || undefined, q: p.get("q") || undefined, page: Number(p.get("page")) || 1, size: 30 }));
}
