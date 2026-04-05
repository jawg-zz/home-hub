import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { monitoring } from "@/lib/monitoring";
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

    const config = await prisma.homeAssistantConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (!config || !config.isConnected || !config.haUrl || !config.haToken) {
      return NextResponse.json(
        createErrorResponse("Home Assistant not connected", 400),
        { status: 400 },
      );
    }

    const devices = await monitoring.trackPerformance(
      "ha-devices-fetch",
      async () => {
        const response = await fetch(`${config.haUrl}/api/states`, {
          headers: {
            Authorization: `Bearer ${config.haToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`HA API error: ${response.status}`);
        }

        const states = await response.json();
        
        return states
          .filter((entity: any) => {
            const domain = entity.entity_id?.split(".")[0];
            return ["light", "switch", "lock", "climate", "sensor", "binary_sensor", "camera"].includes(domain);
          })
          .map((entity: any) => ({
            id: entity.entity_id,
            name: entity.attributes?.friendly_name || entity.entity_id,
            state: entity.state,
            domain: entity.entity_id.split(".")[0],
            attributes: entity.attributes,
            lastChanged: entity.last_changed,
          }));
      },
      { requestId, userId: session.user.id },
    );

    return NextResponse.json(devices);
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: "/api/home-assistant/devices", method: "GET", requestId },
    );
    logger.error("HA devices fetch failed", { requestId, error });
    return NextResponse.json(
      createErrorResponse("Failed to fetch HA devices", 500),
      { status: 500 },
    );
  }
}
