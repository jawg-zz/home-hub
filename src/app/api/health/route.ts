import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { monitoring } from "@/lib/monitoring";

const startTime = Date.now();

export async function GET() {
  try {
    // Check database connectivity
    const dbHealthy = await monitoring
      .trackPerformance("health-check-db", async () => {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      })
      .catch(() => false);

    const uptime = monitoring.getUptime();
    const status = dbHealthy ? "healthy" : "unhealthy";

    const response = {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || "0.1.0",
      checks: {
        database: dbHealthy ? "ok" : "failed",
      },
    };

    return NextResponse.json(response, {
      status: dbHealthy ? 200 : 503,
    });
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/health" },
    );

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 },
    );
  }
}
