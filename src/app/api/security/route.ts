import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestId, createErrorResponse } from "@/lib/request";

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

    const [cameras, locks, alerts] = await Promise.all([
      prisma.camera.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.lock.findMany({
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      prisma.securityAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({ cameras, locks, alerts });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Failed to fetch security data", 500),
      { status: 500 },
    );
  }
}
