import { handlers } from "@/lib/auth";
import { authRateLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const result = await authRateLimiter(request);

  if (!result.allowed) {
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
        },
      },
    );
  }

  return handlers.GET(request as never);
};

export const POST = async (request: Request) => {
  const result = await authRateLimiter(request);

  if (!result.allowed) {
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
        },
      },
    );
  }

  return handlers.POST(request as never);
};
