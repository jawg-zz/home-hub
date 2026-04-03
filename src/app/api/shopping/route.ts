import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shoppingItemSchema } from "@/lib/validations";
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
      logger.warn("Unauthorized shopping list access", { requestId });
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const items = await monitoring.trackPerformance(
      "shopping-list-fetch",
      async () =>
        prisma.shoppingItem.findMany({ orderBy: { createdAt: "desc" } }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(items);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/shopping", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch shopping list", 500),
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

    const body = await request.json();
    const sanitized = sanitizeObject(body);
    const validated = shoppingItemSchema.parse(sanitized);

    const item = await monitoring.trackPerformance(
      "shopping-item-create",
      async () => prisma.shoppingItem.create({ data: validated }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("Shopping item created", { requestId, itemId: item.id });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid shopping item data", {
        requestId,
        errors: error.issues,
      });
      return NextResponse.json(
        createErrorResponse("Invalid item data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/shopping", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create shopping item", 500),
      { status: 500 },
    );
  }
}
