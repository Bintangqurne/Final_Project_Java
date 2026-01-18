import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "0";
  const size = url.searchParams.get("size") ?? "12";
  const q = url.searchParams.get("q");
  const categoryId = url.searchParams.get("categoryId");

  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  if (q && q.trim()) params.set("q", q);
  if (categoryId && categoryId.trim()) params.set("categoryId", categoryId);

  const resp = await fetch(`${BACKEND_BASE_URL}/api/products?${params.toString()}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  return NextResponse.json(data, { status: resp.status });
}
