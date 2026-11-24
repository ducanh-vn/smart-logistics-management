import { NextResponse } from "next/server";
import { requireAccess } from "@/services/auth/guard";
import { updateUser } from "@/services/admin/users";

/** PATCH { role?, active?, unlock?, resetPassword? } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireAccess("admin", "FULL");
  if (g.error) return g.error;
  const res = await updateUser(Number((await params).id), await req.json(), g.user);
  return res.ok ? NextResponse.json(res.data) : NextResponse.json(res, { status: res.status });
}
