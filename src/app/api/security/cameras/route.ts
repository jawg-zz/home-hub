import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const cameraSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  streamUrl: z.string().url().optional().or(z.literal("")),
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

    const cameras = await monitoring.trackPerformance(
      "cameras-fetch",
      async () =>
        prisma.camera.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(cameras);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/cameras", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch cameras", 500),
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
    const validated = cameraSchema.parse(sanitized);

    const camera = await monitoring.trackPerformance(
      "camera-create",
      async () =>
        prisma.camera.create({
          data: {
            name: validated.name,
            location: validated.location,
            streamUrl: validated.streamUrl || null,
            status: "offline",
            userId: roleCheck.user.id,
          },
        }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("Camera created", { requestId, cameraId: camera.id });
    return NextResponse.json(camera, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/security/cameras", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create camera", 500),
      { status: 500 },
    );
  }
}
