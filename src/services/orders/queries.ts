import "server-only";
import { db } from "@/services/db";
import type { OrderStatus, OrderSummary, Zone } from "@/types/order";

export interface OrderFilters {
  q?: string;
  status?: OrderStatus | "";
  warehouseId?: number;
  today?: boolean;
  page?: number;
  size?: number;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Paged order list (design doc 3.2: page/size, max 100). */
export async function listOrders(f: OrderFilters) {
  const size = Math.min(f.size ?? 20, 100);
  const page = Math.max(f.page ?? 1, 1);
  const where = {
    ...(f.status ? { status: f.status } : {}),
    ...(f.warehouseId ? { warehouseId: f.warehouseId } : {}),
    ...(f.today ? { createdAt: { gte: startOfToday() } } : {}),
    ...(f.q
      ? { OR: [{ code: { contains: f.q, mode: "insensitive" as const } }, { receiverName: { contains: f.q, mode: "insensitive" as const } }, { receiverPhone: { contains: f.q } }, { district: { contains: f.q, mode: "insensitive" as const } }] }
      : {}),
  };
  const [total, rows] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * size,
      take: size,
      include: { customer: { select: { name: true } }, warehouse: { select: { code: true } } },
    }),
  ]);
  const items: OrderSummary[] = rows.map((o) => ({
    id: o.id, code: o.code, customerName: o.customer.name, receiverName: o.receiverName, receiverPhone: o.receiverPhone,
    address: o.address, district: o.district, zone: o.zone as Zone, weightKg: o.weightKg, fee: o.fee,
    status: o.status as OrderStatus, warehouseCode: o.warehouse.code, createdAt: o.createdAt.toISOString(),
  }));
  return { items, total, page, size };
}

/** Order detail with items and status history (FR06). */
export async function getOrder(id: number) {
  return db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      warehouse: { select: { code: true, name: true } },
      items: true,
      history: { orderBy: { createdAt: "asc" } },
      stops: { include: { trip: { select: { code: true, vehicle: { select: { plate: true } } } } } },
    },
  });
}
