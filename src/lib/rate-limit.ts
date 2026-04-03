import { NextResponse } from "next/server";
import { getRequestId } from "./request";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function cleanupStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupStore, 60000);

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;

  return async function rateLimitMiddleware(
    request: Request,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const key = `rate-limit:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }

    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetIn: record.resetTime - now,
    };
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

export async function withRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === "development") {
    return handler();
  }

  const result = await authRateLimiter(request);

  if (!result.allowed) {
    const requestId = await getRequestId();
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please try again later",
        retryAfter: Math.ceil(result.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const response = await handler();

  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(result.resetIn / 1000).toString(),
  );

  return response;
}
