import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { createUser, listUsers } from "@/services/admin/users";

export async function GET() {
  const g = await requireAccess("admin");
  if (g.error) return g.error;
  return NextResponse.json(await listUsers());
}

export async function POST(req: Request) {
  const g = await requireAccess("admin", "FULL");
  if (g.error) return g.error;
  const res = await createUser(await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data, { status: 201 }) : NextResponse.json(res, { status: res.status });
}
