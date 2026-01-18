import { NextResponse, type NextRequest } from "next/server";

const ROLE_COOKIE = "oop_lec_role";

export function middleware(req: NextRequest) {
  const role = req.cookies.get(ROLE_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPath) {
    if (role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/" && role === "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};
