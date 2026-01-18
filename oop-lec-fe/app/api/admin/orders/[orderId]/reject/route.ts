import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptToken, getCookieName } from "../../../../../../lib/server/authCookie";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getBearerTokenResult(): Promise<{ token: string | null; reason: "missing" | "invalid" | null }> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(getCookieName())?.value;
  if (!cookieVal) return { token: null, reason: "missing" };
  try {
    return { token: decryptToken(cookieVal), reason: null };
  } catch {
    return { token: null, reason: "invalid" };
  }
}

export async function POST(_req: Request, ctx: { params: Promise<{ orderId: string }> }) {
  const { token, reason } = await getBearerTokenResult();
  if (!token) {
    return NextResponse.json(
      {
        message:
          reason === "missing"
            ? "Unauthorized: missing session (please login)"
            : "Unauthorized: invalid session (please logout and login again)",
      },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  const role = cookieStore.get("oop_lec_role")?.value;
  if (role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await ctx.params;

  const resp = await fetch(
    `${BACKEND_BASE_URL}/api/admin/orders/${encodeURIComponent(orderId)}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await resp.text();
  const data: unknown = text ? safeParseJson(text) : null;

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  return NextResponse.json(data, { status: resp.status });
}
