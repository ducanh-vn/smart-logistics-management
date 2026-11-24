import "server-only";
import { db } from "@/services/db";
import { writeAudit } from "@/services/audit";
import type { CommandResult } from "@/services/orders/commands";
import { SETTING_DEFS } from "@/constants/admin";
import type { PriceRule, Zone } from "@/types/order";
import type { SessionUser } from "@/types/auth";

/** FR34 / TC43 – new prices apply to orders created afterwards; stored fees of old orders stay unchanged. */
export async function updatePriceRule(zone: Zone, input: Omit<PriceRule, "zone">, admin: SessionUser): Promise<CommandResult<PriceRule>> {
  const v = { baseFee: Math.round(Number(input.baseFee)), includedKg: Number(input.includedKg), perKgFee: Math.round(Number(input.perKgFee)) };
  if (!(v.baseFee > 0) || !(v.includedKg >= 0) || !(v.perKgFee >= 0)) return { ok: false, status: 400, message: "Giá trị cước không hợp lệ" };
  const before = await db.priceRule.findUnique({ where: { zone } });
  if (!before) return { ok: false, status: 404, message: "Không có vùng giá này" };
  await db.priceRule.update({ where: { zone }, data: v });
  await writeAudit({ userId: admin.id, action: "UPDATE", entity: "PriceRule", entityId: zone, oldValue: before, newValue: v });
  return { ok: true, data: { zone, ...v } };
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  return Object.fromEntries(SETTING_DEFS.map((d) => [d.key, rows.find((r) => r.key === d.key)?.value ?? d.defaultValue]));
}

export async function getNumberSetting(key: string): Promise<number> {
  const v = Number((await getSettings())[key]);
  return Number.isFinite(v) ? v : Number(SETTING_DEFS.find((d) => d.key === key)?.defaultValue ?? 0);
}

export async function updateSettings(values: Record<string, string>, admin: SessionUser): Promise<CommandResult<Record<string, string>>> {
  const before = await getSettings();
  for (const def of SETTING_DEFS) {
    const v = values[def.key];
    if (v === undefined) continue;
    if (def.type === "number" && !(Number(v) >= 0)) return { ok: false, status: 400, message: `${def.label} phải là số không âm` };
    if (!String(v).trim()) return { ok: false, status: 400, message: `${def.label} không được để trống` };
  }
  for (const def of SETTING_DEFS) {
    const v = values[def.key];
    if (v !== undefined) await db.setting.upsert({ where: { key: def.key }, update: { value: String(v).trim() }, create: { key: def.key, value: String(v).trim() } });
  }
  const after = await getSettings();
  await writeAudit({ userId: admin.id, action: "UPDATE", entity: "Setting", entityId: "system", oldValue: before, newValue: after });
  return { ok: true, data: after };
}
