import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
});

export async function GET() {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      logger.warn("Unauthorized profile access", { requestId });
      return NextResponse.json(
        createErrorResponse("Please sign in to continue", 401),
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse("User not found", 404),
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/user", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch profile", 500),
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const requestId = await getRequestId();

  try {
    const session = await auth();
    if (!session) {
      logger.warn("Unauthorized profile update", { requestId });
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

    const sanitized = sanitizeObject(body);
    const validated = profileUpdateSchema.parse(sanitized);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validated,
      select: { id: true, name: true, email: true, role: true },
    });

    logger.info("Profile updated", { requestId, userId: updatedUser.id });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid profile data", { requestId, errors: error.issues });
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/user", method: "PATCH", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to update profile", 500),
      { status: 500 },
    );
  }
}
