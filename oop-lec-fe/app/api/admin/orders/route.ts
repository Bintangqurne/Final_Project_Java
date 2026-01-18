import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptToken, getCookieName } from "../../../../lib/server/authCookie";

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

function extractOrders(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && "content" in value) {
    const content = (value as { content?: unknown }).content;
    if (Array.isArray(content)) return content;
  }
  return [];
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

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "0";
  const size = url.searchParams.get("size") ?? "10";
  const status = url.searchParams.get("status");

  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  if (status && status.trim()) params.set("status", status);

  const resp = await fetch(`${BACKEND_BASE_URL}/api/admin/orders?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await resp.text();
  const contentType = resp.headers.get("content-type") ?? "";
  const data: unknown = text ? safeParseJson(text) : null;

  if (text && !contentType.includes("application/json")) {
    const trimmed = text.trim();
    if (trimmed.startsWith("<")) {
      return NextResponse.json(
        { message: `Unexpected response from backend (${resp.status})` },
        { status: 502 }
      );
    }
  }

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  return NextResponse.json(extractOrders(data), { status: resp.status });
}
