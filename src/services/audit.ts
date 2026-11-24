import { db } from "./db";

/** FR33 – records changes to important data. */
export async function writeAudit(entry: {
  userId?: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  entity: string;
  entityId: string | number;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await db.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: String(entry.entityId),
      oldValue: entry.oldValue === undefined ? null : JSON.stringify(entry.oldValue),
      newValue: entry.newValue === undefined ? null : JSON.stringify(entry.newValue),
    },
  });
}
