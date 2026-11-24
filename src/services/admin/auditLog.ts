import "server-only";
import { db } from "@/services/db";
import type { AuditRow } from "@/types/admin";

/** UC18 / FR33 – newest first, filter by entity type and by entity id / username text. */
export async function listAudit(f: { entity?: string; q?: string; page: number; size: number }) {
  const where = {
    ...(f.entity ? { entity: f.entity } : {}),
    ...(f.q ? { OR: [{ entityId: { contains: f.q, mode: "insensitive" as const } }, { user: { username: { contains: f.q, mode: "insensitive" as const } } }] } : {}),
  };
  const [total, rows] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, include: { user: { select: { username: true } } }, orderBy: { id: "desc" }, skip: (f.page - 1) * f.size, take: f.size }),
  ]);
  const items: AuditRow[] = rows.map((r) => ({
    id: r.id, at: r.createdAt.toISOString(), username: r.user?.username ?? null, action: r.action,
    entity: r.entity, entityId: r.entityId, oldValue: r.oldValue, newValue: r.newValue,
  }));
  const entities = (await db.auditLog.findMany({ distinct: ["entity"], select: { entity: true } })).map((e) => e.entity);
  return { items, total, page: f.page, size: f.size, entities };
}
