import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PRICE_RULES } from "@/constants/pricing";
import { LOCATION_LAYOUT, WAREHOUSES } from "@/constants/warehouses";
import { GOODS } from "@/constants/mockData";
import { generateCustomers, generateDrivers } from "@/lib/mock/generatePeople";
import { generateVehicles } from "@/lib/mock/generateFleet";
import type { Random } from "@/lib/mock/random";

/** Password for every seeded account. Set SEED_PASSWORD before seeding a public deployment. */
export const DEMO_PASSWORD = process.env.SEED_PASSWORD || "Slms@2026";

export async function seedMaster(db: PrismaClient, r: Random, today: Date) {
  await db.priceRule.createMany({ data: DEFAULT_PRICE_RULES });
  await db.setting.createMany({ data: [{ key: "companyName", value: "Công ty Logistics ABC" }, { key: "dailyCapacity", value: "2000" }] });

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const staff: { username: string; fullName: string; role: string; mustChangePassword?: boolean }[] = [
    { username: "admin", fullName: "Quản trị viên hệ thống", role: "ADMIN" },
    { username: "quanly01", fullName: "Giám đốc vận hành", role: "MANAGER" },
    { username: "nhanvienmoi", fullName: "Nhân viên mới", role: "DISPATCHER", mustChangePassword: true },
  ];
  for (let i = 1; i <= 10; i++) staff.push({ username: `dieuphoi${String(i).padStart(2, "0")}`, fullName: `Điều phối viên ${i}`, role: "DISPATCHER" });
  for (let i = 1; i <= 12; i++) staff.push({ username: `thukho${String(i).padStart(2, "0")}`, fullName: `Thủ kho ${i}`, role: "STOREKEEPER" });
  await db.user.createMany({ data: staff.map((s) => ({ ...s, passwordHash: hash })) });

  for (const w of WAREHOUSES) {
    const wh = await db.warehouse.create({ data: w });
    const codes: string[] = [];
    for (const z of LOCATION_LAYOUT.zones)
      for (let k = 1; k <= LOCATION_LAYOUT.racks; k++)
        for (let s = 1; s <= LOCATION_LAYOUT.slots; s++) codes.push(`${z}-${String(k).padStart(2, "0")}-${String(s).padStart(2, "0")}`);
    await db.location.createMany({ data: codes.map((code) => ({ code, warehouseId: wh.id })) });
    // A-01-03 is left empty for the "assign a location on receipt" test (TC23).
    const locs = (await db.location.findMany({ where: { warehouseId: wh.id }, orderBy: { id: "asc" } })).filter((l) => l.code !== "A-01-03");
    // Stock: one SKU per goods type in the first locations; MV001 = 20 units (TC04), MV002 near minimum (TC24).
    await db.stockItem.createMany({
      data: GOODS.map((g, i) => ({
        locationId: locs[i].id,
        barcode: `MV${String(i + 1).padStart(3, "0")}`,
        name: g.name,
        quantity: i === 0 ? 20 : i === 1 ? 11 : r.int(80, 400),
        minQty: 10,
      })),
    });
  }

  const drivers = generateDrivers(r, 60);
  for (const d of drivers) {
    const user = await db.user.create({
      data: { username: d.code.replace("TX", "taixe"), fullName: d.fullName, role: "DRIVER", passwordHash: hash },
    });
    await db.driver.create({ data: { ...d, userId: user.id } });
  }

  const vehicles = generateVehicles(r, 50, today);
  await db.vehicle.createMany({ data: vehicles.map(({ warehouseIndex: _w, ...v }) => v) });
  await db.customer.createMany({ data: generateCustomers(r, 150) });
}
