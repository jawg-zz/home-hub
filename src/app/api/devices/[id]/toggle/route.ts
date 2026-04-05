import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceStatusSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();
  const session = await auth();

  if (!session) {
    logger.warn("Unauthorized device toggle attempt", { requestId });
    return NextResponse.json(
      createErrorResponse("Please sign in to continue", 401),
      { status: 401 },
    );
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
    const validated = deviceStatusSchema.parse(body);

    const device = await monitoring.trackPerformance(
      "device-toggle",
      async () =>
        prisma.device.update({
          where: { id },
          data: validated,
        }),
      { requestId, userId: session.user.id, deviceId: id },
    );

    logger.info("Device toggled", {
      requestId,
      deviceId: id,
      status: validated.status,
    });
    return NextResponse.json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid device status data", {
        requestId,
        errors: error.issues,
      });
      return NextResponse.json(
        createErrorResponse("Invalid device status", 400, error.issues),
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
      { endpoint: "/api/devices/:id/toggle", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to update device", 500),
      { status: 500 },
    );
  }
}
