import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const haConfigSchema = z.object({
  haUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  haToken: z.string().optional().or(z.literal("")),
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

    const config = await prisma.homeAssistantConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (!config) {
      return NextResponse.json({ isConnected: false, haUrl: null });
    }

    return NextResponse.json({
      isConnected: config.isConnected,
      haUrl: config.haUrl,
    });
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/home-assistant", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch HA config", 500),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

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
    const validated = haConfigSchema.parse(sanitized);

    const haUrl = validated.haUrl || null;
    const haToken = validated.haToken || null;

    let isConnected = false;

    if (haUrl && haToken) {
      try {
        const response = await fetch(`${haUrl}/api/states`, {
          headers: {
            Authorization: `Bearer ${haToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          isConnected = true;
          logger.info("Home Assistant connected", { requestId, userId: session.user.id });
        } else {
          logger.warn("HA connection test failed", { requestId, status: response.status });
        }
      } catch (err) {
        logger.warn("HA connection error", { requestId, error: err });
      }
    }

    const config = await prisma.homeAssistantConfig.upsert({
      where: { userId: session.user.id },
      update: {
        haUrl,
        haToken: haToken ? haToken : undefined,
        isConnected,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        haUrl,
        haToken: haToken || "",
        isConnected,
      },
    });

    return NextResponse.json({
      isConnected: config.isConnected,
      haUrl: config.haUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/home-assistant", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to save HA config", 500),
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    await prisma.homeAssistantConfig.delete({
      where: { userId: session.user.id },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/home-assistant", method: "DELETE", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to disconnect HA", 500),
      { status: 500 },
    );
  }
}
