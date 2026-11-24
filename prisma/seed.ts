// Day boundaries in the demo data follow Vietnam time, whatever the machine running the seed uses.
process.env.TZ = process.env.APP_TZ || "Asia/Ho_Chi_Minh";
import { PrismaClient } from "@prisma/client";
import { createRandom } from "@/lib/mock/random";
import { seedMaster, DEMO_PASSWORD } from "./seed/seedMaster";
import { seedOrders } from "./seed/seedOrders";

const db = new PrismaClient();

async function main() {
  const existing = await db.user.count();
  if (existing > 0) {
    console.log("Database already has data. Run `npm run db:reset` to start over.");
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const r = createRandom(2026);
  console.time("seed");
  await seedMaster(db, r, today);
  await seedOrders(db, r, today);
  console.timeEnd("seed");
  const [orders, trips] = await Promise.all([db.order.count(), db.trip.count()]);
  console.log(`Seeded ${orders} orders, ${trips} trips. Demo password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
