import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
import { getRequestId, createErrorResponse } from "@/lib/request";
import { sanitizeObject } from "@/lib/sanitize";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createUserSchema } from "@/lib/validations";

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

    const users = await monitoring.trackPerformance(
      "users-fetch",
      async () =>
        prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true },
          orderBy: { createdAt: "asc" },
        }),
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(users);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/users", method: "GET", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to fetch users", 500),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const requestId = await getRequestId();

  try {
    const roleCheck = await requireRole("admin");
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
    const validated = createUserSchema.parse(sanitized);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse("User with this email already exists", 400),
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await monitoring.trackPerformance(
      "user-create",
      async () =>
        prisma.user.create({
          data: {
            email: validated.email,
            password: hashedPassword,
            name: validated.name,
            role: validated.role,
          },
          select: { id: true, name: true, email: true, role: true },
        }),
      { requestId, userId: roleCheck.user.id },
    );

    logger.info("User created", { requestId, userId: user.id });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse("Invalid data", 400, error.issues),
        { status: 400 },
      );
    }

    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/users", method: "POST", requestId },
    );
    return NextResponse.json(
      createErrorResponse("Failed to create user", 500),
      { status: 500 },
    );
  }
}
