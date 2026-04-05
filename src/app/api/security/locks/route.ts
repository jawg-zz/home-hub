import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const lockSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
});

export async function GET() {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const locks = await monitoring.trackPerformance(
      "locks-fetch",
      async () =>
        prisma.lock.findMany({
          orderBy: { updatedAt: "desc" },
          take: 100,
        }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(locks);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/locks", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch locks", 500),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const requestId = await getRequestId();

  try {
    const roleCheck = await requireRole("member");
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse("Invalid JSON body", 400),
        { status: 400 },
      );
    }

    const sanitized = sanitizeObject(body);
    const validated = lockSchema.parse(sanitized);

    const lock = await monitoring.trackPerformance(
      "lock-create",
      async () =>
        prisma.lock.create({
          data: {
            name: validated.name,
            location: validated.location,
            status: "locked",
            userId: roleCheck.user.id,
          },
        }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("Lock created", { requestId, lockId: lock.id });
    return NextResponse.json(lock, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/locks", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create lock", 500),
      { status: 500 },
    );
  }
}
