import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { choreSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      logger.warn("Unauthorized chores access", { requestId });
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const chores = await monitoring.trackPerformance(
      "chores-fetch",
      async () => prisma.chore.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(chores);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/chores", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch chores", 500),
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
    const validated = choreSchema.parse(sanitized);

    const chore = await monitoring.trackPerformance(
      "chore-create",
      async () => prisma.chore.create({ data: validated }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("Chore created", { requestId, choreId: chore.id });
    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid chore data", { requestId, errors: error.issues });
      return NextResponse.json(
        createErrorResponse("Invalid chore data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/chores", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create chore", 500),
      { status: 500 },
    );
  }
}
