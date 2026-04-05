import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireAdmin, requireRole } from "@/lib/rbac";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      logger.warn("Unauthorized device access", { requestId });
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const { id } = await params;

    const device = await monitoring.trackPerformance(
      "device-fetch",
      async () => prisma.device.findUnique({ where: { id } }),
      { requestId, userId: session.user.id, deviceId: id },
    );

    if (!device) {
      return NextResponse.json(createErrorResponse("Device not found", 404), {
        status: 404,
      });
    }

    return NextResponse.json(device);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/devices/:id", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch device", 500),
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();

  try {
    const roleCheck = await requireRole("member");
    if (roleCheck instanceof NextResponse) {
      logger.warn("Unauthorized device update attempt", { requestId });
      return roleCheck;
    }

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
    const validated = deviceSchema.partial().parse(sanitized);

    const device = await monitoring.trackPerformance(
      "device-update",
      async () =>
        prisma.device.update({
          where: { id },
          data: validated,
        }),
      { requestId, userId: roleCheck.user.id, deviceId: id },
    );

    logger.info("Device updated", { requestId, deviceId: id });
    return NextResponse.json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid device update data", {
        requestId,
        errors: error.issues,
      });
      return NextResponse.json(
        createErrorResponse("Invalid device data", 400, error.issues),
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Device not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/devices/:id", method: "PATCH", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to update device", 500),
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();

  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { id } = await params;

    await monitoring.trackPerformance(
      "device-delete",
      async () => prisma.device.delete({ where: { id } }),
      { requestId, userId: adminCheck.user.id, deviceId: id },
    );

    logger.info("Device deleted", { requestId, deviceId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(createErrorResponse("Device not found", 404), {
        status: 404,
      });
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/devices/:id", method: "DELETE", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to delete device", 500),
      { status: 500 },
    );
  }
}
