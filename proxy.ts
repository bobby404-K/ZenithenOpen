import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Production Security & Request Tracing Middleware
 * Location: middleware.ts
 *
 * Enforces:
 * 1. Distributed request tracing with unique x-request-id
 * 2. Platform version tagging with x-zenithen-version
 * 3. Security response headers (nosniff, frame protection, referrer policy)
 * 4. Suspicious path traversal & probe mitigation
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Basic path traversal & scanner probe mitigation
  if (
    pathname.includes("..") ||
    pathname.includes(".php") ||
    pathname.includes(".env") ||
    pathname.includes("/wp-admin") ||
    pathname.includes("/wp-login")
  ) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Access denied" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Forward request with tracking headers
  const response = NextResponse.next();

  // Unique request correlation ID
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-zenithen-version", "1.29.0");

  // Base security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static Next.js assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
