import { prisma } from "@/lib/prisma";
import DeviceCard from "./DeviceCard";

type Device = {
  id: string;
  name: string;
  type: string;
  room: string;
  status: string;
  value: number;
  online: boolean;
};

export default async function DevicesPage() {
  const devices: Device[] = await prisma.device.findMany();

  return (
    <div>
      <header
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Devices</h1>
          <p style={{ color: "#666" }}>Manage your smart home devices</p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span>🔄</span> Sync with Home Assistant
        </button>
      </header>

      {/* Device Stats */}
      <div className="grid grid-4" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ color: "#666", fontSize: "0.875rem" }}>
            Total Devices
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {devices.length}
          </div>
        </div>
        <div className="card">
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Online</div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00d4aa" }}
          >
            {devices.filter((d) => d.online).length}
          </div>
        </div>
        <div className="card">
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Offline</div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ff6b35" }}
          >
            {devices.filter((d) => !d.online).length}
          </div>
        </div>
        <div className="card">
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Lights On</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {
              devices.filter((d) => d.type === "light" && d.status === "on")
                .length
            }
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-3">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
