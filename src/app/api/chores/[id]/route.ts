import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { choreUpdateSchema } from "@/lib/validations";
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
    logger.warn("Unauthorized chore update attempt", { requestId });
    return roleCheck;
  }

  try {
    const { id } = await params;
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
    const validated = choreUpdateSchema.parse(sanitized);

    const chore = await monitoring.trackPerformance(
      "chore-update",
      async () =>
        prisma.chore.update({
          where: { id },
          data: validated,
        }),
      { requestId, userId: roleCheck.user.id, choreId: id },
    );

    logger.info("Chore updated", { requestId, choreId: id });
    return NextResponse.json(chore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid chore update data", {
        requestId,
        errors: error.issues,
      });
      return NextResponse.json(
        createErrorResponse("Invalid chore data", 400, error.issues),
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Chore not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/chores/:id", method: "PATCH", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to update chore", 500),
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
    logger.warn("Unauthorized chore delete attempt", { requestId });
    return roleCheck;
  }

  try {
    const { id } = await params;

    await monitoring.trackPerformance(
      "chore-delete",
      async () => prisma.chore.delete({ where: { id } }),
      { requestId, userId: roleCheck.user.id, choreId: id },
    );

    logger.info("Chore deleted", { requestId, choreId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Chore not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/chores/:id", method: "DELETE", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to delete chore", 500),
      { status: 500 },
    );
  }
}
