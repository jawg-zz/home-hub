import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const alertSchema = z.object({
  type: z.enum(["motion", "unlock", "lock", "camera_offline", "system"]),
  message: z.string().min(1, "Message is required").max(500),
  source: z.string().max(100).optional(),
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

    const alerts = await monitoring.trackPerformance(
      "alerts-fetch",
      async () =>
        prisma.securityAlert.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(alerts);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/alerts", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch alerts", 500),
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
    const validated = alertSchema.parse(sanitized);

    const alert = await monitoring.trackPerformance(
      "alert-create",
      async () =>
        prisma.securityAlert.create({
          data: {
            type: validated.type,
            message: validated.message,
            source: validated.source || null,
            userId: roleCheck.user.id,
          },
        }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("Security alert created", { requestId, alertId: alert.id });
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/alerts", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create alert", 500),
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
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

    const { alertId } = body;
    if (!alertId) {
      return NextResponse.json(
        createErrorResponse("Alert ID required", 400),
        { status: 400 },
      );
    }

    await prisma.securityAlert.update({
      where: { id: alertId },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/alerts", method: "PATCH", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to mark alert as read", 500),
      { status: 500 },
    );
  }
}
