import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Camera = {
  id: string;
  name: string;
  location: string;
  status: string;
  streamUrl: string | null;
};

type Lock = {
  id: string;
  name: string;
  location: string;
  status: string;
  lastActivity: Date | null;
};

type Alert = {
  id: string;
  type: string;
  message: string;
  source: string | null;
  read: boolean;
  createdAt: Date;
};

export default async function SecurityPage() {
  const session = await auth();

  const [cameras, locks, alerts]: [Camera[], Lock[], Alert[]] = await Promise.all([
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

  const defaultCameras = [
    { id: "1", name: "Front Door", location: "Entrance", status: "online" },
    { id: "2", name: "Backyard", location: "Garden", status: "online" },
    { id: "3", name: "Garage", location: "Garage", status: "offline" },
    { id: "4", name: "Living Room", location: "Indoor", status: "online" },
  ];

  const defaultLocks = [
    { id: "1", name: "Front Door", status: "locked", lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: "2", name: "Back Door", status: "unlocked", lastActivity: new Date(Date.now() - 30 * 60 * 1000) },
  ];

  const displayCameras = cameras.length > 0 ? cameras : defaultCameras;
  const displayLocks = locks.length > 0 ? locks : defaultLocks;

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return "Unknown";
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (mins > 0) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Security</h1>
        <p style={{ color: "#666" }}>Monitor your home security</p>
      </header>

      {/* Camera Grid */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
          📹 Cameras
        </h2>
        <div className="grid grid-2">
          {displayCameras.map((camera) => (
            <div
              key={camera.id}
              style={{
                background: "#151515",
                borderRadius: "12px",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {camera.status === "online" ? (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "3rem", opacity: 0.3 }}>📹</span>
                </div>
              ) : (
                <div style={{ color: "#666" }}>Camera Offline</div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "0.75rem",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{camera.name}</div>
                    <div style={{ color: "#666", fontSize: "0.75rem" }}>
                      {camera.location}
                    </div>
                  </div>
                  <span
                    className={`badge ${camera.status === "online" ? "badge-success" : "badge-offline"}`}
                  >
                    {camera.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locks */}
      <div className="grid grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
            🔒 Smart Locks
          </h2>
          {displayLocks.map((lock) => (
            <div
              key={lock.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "#151515",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {lock.status === "locked" ? "🔒" : "🔓"}
                </span>
                <div>
                  <div style={{ fontWeight: 500 }}>{lock.name}</div>
                  <div style={{ color: "#666", fontSize: "0.75rem" }}>
                    {formatTimeAgo(lock.lastActivity)}
                  </div>
                </div>
              </div>
              <span
                className={`badge ${lock.status === "locked" ? "badge-success" : "badge-warning"}`}
              >
                {lock.status}
              </span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
            ⚠️ Recent Alerts
          </h2>
          {alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#151515",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>
                  {alert.type === "motion" ? "👁️" : alert.type === "unlock" ? "🔓" : "⚠️"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{alert.message}</div>
                  <div style={{ color: "#666", fontSize: "0.75rem" }}>
                    {formatTimeAgo(new Date(alert.createdAt))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                background: "#151515",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>👁️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Motion detected at Front Door</div>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>5 mins ago</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <p style={{ color: "#666", textAlign: "center" }}>
          📷 Add cameras and locks from the settings to see real-time data
        </p>
      </div>
    </div>
  );
}
