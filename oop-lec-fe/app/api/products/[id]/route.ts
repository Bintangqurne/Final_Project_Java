import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const resp = await fetch(`${BACKEND_BASE_URL}/api/products/${encodeURIComponent(id)}`);
  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  return NextResponse.json(data, { status: resp.status });
}
