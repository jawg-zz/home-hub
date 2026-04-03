import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiter (note: won't work properly in serverless environments)
// For production, use Redis or a dedicated rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes - cleanup old entries
let lastCleanup = Date.now();

// Periodic cleanup of stale entries
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
    lastCleanup = now;
  }
}

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for health check endpoint
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  cleanupStaleEntries();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();

  const rateLimitData = rateLimitMap.get(ip);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // New window or expired window
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (rateLimitData.count >= RATE_LIMIT) {
    // Calculate retry-after time
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  // Increment count
  rateLimitData.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
