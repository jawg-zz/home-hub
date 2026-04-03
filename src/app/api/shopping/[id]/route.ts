import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shoppingItemUpdateSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();
  const roleCheck = await requireRole("member");

  if (roleCheck instanceof NextResponse) {
    logger.warn("Unauthorized shopping item update attempt", { requestId });
    return roleCheck;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const sanitized = sanitizeObject(body);
    const validated = shoppingItemUpdateSchema.parse(sanitized);

    const item = await monitoring.trackPerformance(
      "shopping-item-update",
      async () =>
        prisma.shoppingItem.update({
          where: { id },
          data: validated,
        }),
      { requestId, userId: roleCheck.user.id, itemId: id },
    );

    logger.info("Shopping item updated", { requestId, itemId: id });
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid shopping item update data", {
        requestId,
        errors: error.issues,
      });
      return NextResponse.json(
        createErrorResponse("Invalid item data", 400, error.issues),
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Item not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/shopping/:id", method: "PATCH", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to update item", 500),
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();
  const roleCheck = await requireRole("member");

  if (roleCheck instanceof NextResponse) {
    logger.warn("Unauthorized shopping item delete attempt", { requestId });
    return roleCheck;
  }

  try {
    const { id } = await params;

    await monitoring.trackPerformance(
      "shopping-item-delete",
      async () => prisma.shoppingItem.delete({ where: { id } }),
      { requestId, userId: roleCheck.user.id, itemId: id },
    );

    logger.info("Shopping item deleted", { requestId, itemId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Item not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/shopping/:id", method: "DELETE", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to delete item", 500),
      { status: 500 },
    );
  }
}
