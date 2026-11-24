import type { PrismaClient } from "@prisma/client";
import { calculateFee } from "@/lib/pricing";
import { orderCode } from "@/lib/format";
import { generateOrders, type MockOrder } from "@/lib/mock/generateOrders";
import type { Random } from "@/lib/mock/random";
import type { PriceRule } from "@/types/order";

const DAY = 86_400_000;
const HISTORY_DAYS = 7;

interface Ctx {
  db: PrismaClient;
  r: Random;
  rules: PriceRule[];
  whId: Record<string, number>;
  customerIds: number[];
}

const toRow = (c: Ctx, o: MockOrder, code: string, created: Date) => ({
  code,
  customerId: c.customerIds[o.customerIndex],
  warehouseId: c.whId[o.warehouseCode],
  receiverName: o.receiverName,
  receiverPhone: o.receiverPhone,
  address: o.address,
  district: o.district,
  zone: o.zone,
  lat: o.lat,
  lng: o.lng,
  weightKg: o.weightKg,
  volumeM3: o.volumeM3,
  fee: calculateFee(o.weightKg, o.zone, c.rules),
  status: o.status,
  expectedDate: new Date(created.getTime() + DAY),
  createdAt: created,
});

/** Past days: ~1.200 orders/day, mostly delivered, grouped into trips for reports. */
async function seedHistory(c: Ctx, today: Date) {
  const vehicles = await c.db.vehicle.findMany({ where: { status: "READY" } });
  const drivers = await c.db.driver.findMany();
  let tripSeq = 0;
  for (let back = HISTORY_DAYS; back >= 1; back--) {
    const day = new Date(today.getTime() - back * DAY);
    const n = c.r.int(1150, 1260);
    const mocks = generateOrders(c.r, n, c.customerIds.length, () => {
      const x = c.r.next();
      return x < 0.955 ? "DELIVERED" : x < 0.975 ? "RETURNED" : "CANCELLED";
    });
    await c.db.order.createMany({ data: mocks.map((o, i) => toRow(c, o, orderCode(day, i + 1), new Date(day.getTime() + 7 * 3600_000))) });
    const delivered = await c.db.order.findMany({ where: { code: { startsWith: orderCode(day, 0).slice(0, 8) }, status: "DELIVERED" }, orderBy: { id: "asc" } });
    // Pack delivered orders into trips per warehouse (simple fill up to 85% capacity).
    for (const whId of Object.values(c.whId)) {
      const list = delivered.filter((o) => o.warehouseId === whId);
      let v = 0;
      while (list.length) {
        const vehicle = vehicles[(v + whId * 7) % vehicles.length];
        const batch: typeof list = [];
        let kg = 0;
        while (list.length && kg + list[0].weightKg <= vehicle.capacityKg * 0.85) {
          kg += list[0].weightKg;
          batch.push(list.shift()!);
        }
        if (!batch.length) batch.push(list.shift()!);
        tripSeq++;
        const trip = await c.db.trip.create({
          data: {
            code: `CX${String(tripSeq).padStart(6, "0")}`, date: day, warehouseId: whId, vehicleId: vehicle.id,
            driverId: drivers[(tripSeq * 7) % drivers.length].id, totalKg: kg, totalKm: Math.round(c.r.int(22, 65) * 10) / 10, status: "DONE",
          },
        });
        await c.db.stop.createMany({
          data: batch.map((o, i) => {
            const late = c.r.next() < 0.05; // ~95% on time
            const done = new Date(day.getTime() + (late ? 34 : 8 + Math.min(i * 0.15, 9)) * 3600_000);
            return { tripId: trip.id, orderId: o.id, seq: i + 1, otpOk: true, doneAt: done };
          }),
        });
        v++;
      }
    }
  }
}

/** Today: pending and approved orders ready for the dispatch demo (with items for warehouse issue). */
async function seedToday(c: Ctx, today: Date) {
  // Orders are created from 07:00 but never later than "now", so status history stays in time order.
  const end = Math.min(Date.now() - 15 * 60_000, today.getTime() + 12 * 3600_000);
  const start = Math.max(today.getTime(), Math.min(today.getTime() + 7 * 3600_000, end - 300 * 60_000));
  const step = Math.max(1000, (end - start) / 300);
  const mocks = generateOrders(c.r, 300, c.customerIds.length, (i) => (i < 60 ? "PENDING" : "APPROVED"));
  let i = 0;
  for (const o of mocks) {
    i++;
    const created = new Date(start + i * step);
    await c.db.order.create({
      data: {
        ...toRow(c, o, orderCode(today, i), created),
        items: { create: o.items },
        history: {
          create: [
            { status: "PENDING", actor: "dieuphoi01", createdAt: created },
            ...(o.status === "APPROVED" ? [{ status: "APPROVED", actor: "dieuphoi01", createdAt: new Date(Math.min(created.getTime() + 600_000, end)) }] : []),
          ],
        },
      },
    });
  }
}

export async function seedOrders(db: PrismaClient, r: Random, today: Date) {
  const rules = (await db.priceRule.findMany()) as PriceRule[];
  const whs = await db.warehouse.findMany();
  const customers = await db.customer.findMany({ select: { id: true } });
  const ctx: Ctx = { db, r, rules, whId: Object.fromEntries(whs.map((w) => [w.code, w.id])), customerIds: customers.map((x) => x.id) };
  await seedHistory(ctx, today);
  await seedToday(ctx, today);
}
