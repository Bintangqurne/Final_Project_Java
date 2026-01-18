import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const role = cookieStore.get("oop_lec_role")?.value ?? null;
  const name = cookieStore.get("oop_lec_name")?.value ?? null;
  const email = cookieStore.get("oop_lec_email")?.value ?? null;

  return NextResponse.json({ role, name, email }, { status: 200 });
}
