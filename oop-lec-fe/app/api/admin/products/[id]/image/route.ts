import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptToken, getCookieName } from "../../../../../../lib/server/authCookie";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

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

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = await getBearerToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  const backendForm = new FormData();
  backendForm.append("file", file, file.name);

  const resp = await fetch(`${BACKEND_BASE_URL}/api/admin/products/${encodeURIComponent(id)}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: backendForm,
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
