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

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(getCookieName())?.value;
  if (!cookieVal) return null;
  try {
    return decryptToken(cookieVal);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const token = await getBearerToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "0";
  const size = url.searchParams.get("size") ?? "10";

  const resp = await fetch(`${BACKEND_BASE_URL}/api/admin/products?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  return NextResponse.json(data, { status: resp.status });
}

export async function POST(req: Request) {
  const token = await getBearerToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.text();
  const resp = await fetch(`${BACKEND_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  return NextResponse.json(data, { status: resp.status });
}
