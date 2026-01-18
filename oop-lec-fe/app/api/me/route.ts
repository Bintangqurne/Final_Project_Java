import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptToken, getCookieName } from "../../../lib/server/authCookie";

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

export async function GET() {
  const token = await getBearerToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resp = await fetch(`${BACKEND_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export async function PUT(req: Request) {
  const token = await getBearerToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.text();

  const resp = await fetch(`${BACKEND_BASE_URL}/api/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(rawBody ? { "Content-Type": "application/json" } : {}),
    },
    body: rawBody || undefined,
  });

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  const res = NextResponse.json(data, { status: resp.status });

  if (data && typeof data === "object") {
    const name = (data as { name?: unknown }).name;
    const email = (data as { email?: unknown }).email;

    if (typeof name === "string") {
      res.cookies.set("oop_lec_name", name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? "86400"),
      });
    }

    if (typeof email === "string") {
      res.cookies.set("oop_lec_email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? "86400"),
      });
    }
  }

  return res;
}
