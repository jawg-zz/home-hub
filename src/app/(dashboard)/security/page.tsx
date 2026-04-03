export default function SecurityPage() {
  const cameras = [
    { id: "1", name: "Front Door", location: "Entrance", status: "online" },
    { id: "2", name: "Backyard", location: "Garden", status: "online" },
    { id: "3", name: "Garage", location: "Garage", status: "offline" },
    { id: "4", name: "Living Room", location: "Indoor", status: "online" },
  ];

  const locks = [
    {
      id: "1",
      name: "Front Door",
      status: "locked",
      lastActivity: "2 hours ago",
    },
    {
      id: "2",
      name: "Back Door",
      status: "unlocked",
      lastActivity: "30 mins ago",
    },
  ];

  const alerts = [
    {
      id: "1",
      type: "motion",
      message: "Motion detected at Front Door",
      time: "5 mins ago",
    },
    {
      id: "2",
      type: "unlock",
      message: "Back Door unlocked",
      time: "30 mins ago",
    },
    {
      id: "3",
      type: "motion",
      message: "Motion detected in Backyard",
      time: "1 hour ago",
    },
  ];

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
          {cameras.map((camera) => (
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
          {locks.map((lock) => (
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
                    {lock.lastActivity}
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
          {alerts.map((alert) => (
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
                {alert.type === "motion" ? "👁️" : "🔓"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{alert.message}</div>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>
                  {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p style={{ color: "#666", textAlign: "center" }}>
          📷 Connect RTSP cameras or integrate with Home Assistant for live
          feeds
        </p>
      </div>
    </div>
  );
}
