import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/services/db";

type Client = Prisma.TransactionClient | typeof db;

/** FR27 – mocked SMS gateway: the message is stored and printed instead of being sent. */
export async function sendSms(phone: string, content: string, orderId?: number, client: Client = db) {
  await client.smsMessage.create({ data: { phone, content, orderId } });
  console.log(`[SMS → ${phone}] ${content}`);
}
