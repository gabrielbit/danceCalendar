import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Admin routes require admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || role !== "admin") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  // Event creation requires auth
  if (pathname.startsWith("/events/new") || pathname.match(/\/events\/[^/]+\/edit/)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/events/new", "/events/:id/edit"],
};
