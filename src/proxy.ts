import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing.
 * - admin.<domain> (e.g. admin.localhost:3000, admin.ksproperties.in) serves the dashboard,
 *   whose routes live under app/admin/*: "/leads" on the admin host → "/admin/leads".
 * - Every other host is the public site; /admin and /api/admin are hidden there (404).
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const isAdminHost = host.startsWith("admin.");
  const { pathname } = req.nextUrl;

  if (isAdminHost) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain" } });
    }
    // Admin APIs are called directly; public APIs aren't served on the admin host.
    if (pathname.startsWith("/api/")) {
      return pathname.startsWith("/api/admin/") ? NextResponse.next() : notFound();
    }
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return notFound();
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin")) return notFound();
  return NextResponse.next();
}

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: { "content-type": "text/plain" } });
}

export const config = {
  // Skip Next internals and files with an extension (public assets).
  matcher: ["/robots.txt", "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
