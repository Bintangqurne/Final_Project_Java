import { NextResponse } from "next/server";
import { cookieOptions, encryptToken, getCookieName } from "../../../../lib/server/authCookie";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

type LoginRequest = {
  identifier: string;
  password: string;
};

type BackendAuthResponse = {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  username: string;
  email: string;
  role: string;
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export async function POST(req: Request) {
  const body = (await req.json()) as LoginRequest;

  const resp = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    return NextResponse.json(
      { message: extractMessage(data) ?? `Request failed (${resp.status})` },
      { status: resp.status }
    );
  }

  const auth = data as BackendAuthResponse;
  const encrypted = encryptToken(auth.token);

  const res = NextResponse.json(
    {
      userId: auth.userId,
      name: auth.name,
      username: auth.username,
      email: auth.email,
      role: auth.role,
    },
    { status: 200 }
  );

  res.cookies.set(getCookieName(), encrypted, cookieOptions());
  res.cookies.set("oop_lec_role", auth.role, cookieOptions());
  res.cookies.set("oop_lec_name", auth.name, cookieOptions());
  res.cookies.set("oop_lec_email", auth.email, cookieOptions());
  return res;
}
