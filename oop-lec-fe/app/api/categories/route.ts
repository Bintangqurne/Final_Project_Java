import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "0";
  const size = url.searchParams.get("size") ?? "50";

  const resp = await fetch(
    `${BACKEND_BASE_URL}/api/categories?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  const text = await resp.text();
  const data: unknown = text ? JSON.parse(text) : null;

  return NextResponse.json(data, { status: resp.status });
}
