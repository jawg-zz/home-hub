"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
};

export default function SettingsPage({
  session,
  users,
}: {
  session: { user?: SessionUser } | null;
  users: User[];
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeLoading, setThemeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const { showToast } = useToast();

  const [haUrl, setHaUrl] = useState("");
  const [haToken, setHaToken] = useState("");
  const [haConnected, setHaConnected] = useState(false);
  const [haLoading, setHaLoading] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"member" | "viewer">("viewer");
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  const isAdmin = session?.user?.email === "demo@home.com";

  useEffect(() => {
    fetch("/api/home-assistant")
      .then((res) => res.json())
      .then((data) => {
        if (data.haUrl) {
          setHaUrl(data.haUrl);
          setHaConnected(data.isConnected);
        }
      })
      .catch(console.error);
  }, []);

  const toggleTheme = async (newTheme: "dark" | "light") => {
    setThemeLoading(true);
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTimeout(() => {
      setThemeLoading(false);
      showToast(`Switched to ${newTheme} mode`, "success");
    }, 300);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error("Failed to save profile:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleHaConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!haUrl || !haToken) {
      showToast("Please enter both HA URL and token", "error");
      return;
    }

    setHaLoading(true);
    try {
      const response = await fetch("/api/home-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haUrl, haToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect");
      }

      setHaConnected(data.isConnected);
      if (data.isConnected) {
        showToast("Connected to Home Assistant", "success");
      } else {
        showToast("Could not connect to Home Assistant", "error");
      }
    } catch (error) {
      console.error("HA connection error:", error);
      showToast("Failed to connect to Home Assistant", "error");
    } finally {
      setHaLoading(false);
    }
  };

  const handleHaDisconnect = async () => {
    setHaLoading(true);
    try {
      await fetch("/api/home-assistant", { method: "DELETE" });
      setHaConnected(false);
      setHaUrl("");
      setHaToken("");
      showToast("Disconnected from Home Assistant", "success");
    } catch (error) {
      showToast("Failed to disconnect", "error");
    } finally {
      setHaLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName || !newMemberPassword) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setAddMemberLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName,
          password: newMemberPassword,
          role: newMemberRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add member");
      }

      showToast("Family member added successfully", "success");
      setShowAddMember(false);
      setNewMemberEmail("");
      setNewMemberName("");
      setNewMemberPassword("");
      window.location.reload();
    } catch (error) {
      console.error("Add member error:", error);
      showToast(error instanceof Error ? error.message : "Failed to add member", "error");
    } finally {
      setAddMemberLoading(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Settings</h1>
        <p style={{ color: "#999" }}>Manage your account and preferences</p>
      </header>

      <div className="grid grid-2">
        {/* Profile */}
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
            👤 Profile
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#0f0f0f",
              }}
            >
              {session?.user?.name?.[0] || "U"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>
                {session?.user?.name}
              </div>
              <div style={{ color: "#999" }}>{session?.user?.email}</div>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            style={{ display: "grid", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#999",
                  fontSize: "0.875rem",
                }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#999",
                  fontSize: "0.875rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                style={{ width: "100%" }}
                disabled
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "fit-content" }}
              disabled={saveLoading}
            >
              {saveLoading ? "Loading..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Family Members */}
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
            👨‍👩‍👧‍👦 Family Members
          </h2>
          <div
            style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}
          >
            {users.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "#999",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  👥
                </div>
                <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
                  No family members yet
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  Add family members to share access
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    background: "#151515",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {user.name?.[0] || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                    <div style={{ color: "#999", fontSize: "0.75rem" }}>
                      {user.email}
                    </div>
                  </div>
                  <span
                    className={`badge ${user.role === "admin" ? "badge-success" : "badge-warning"}`}
                  >
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
          {isAdmin && (
            <button 
              className="btn btn-secondary" 
              style={{ width: "100%" }}
              onClick={() => setShowAddMember(!showAddMember)}
            >
              + Add Family Member
            </button>
          )}
          {showAddMember && (
            <form onSubmit={handleAddMember} style={{ marginTop: "1rem" }}>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{ width: "100%" }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  style={{ width: "100%" }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as "member" | "viewer")}
                  style={{ width: "100%" }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                </select>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addMemberLoading}
                    style={{ flex: 1 }}
                  >
                    {addMemberLoading ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddMember(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Home Assistant */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
          🏠 Home Assistant Integration
        </h2>
        <p style={{ color: "#999", marginBottom: "1rem" }}>
          {haConnected
            ? "Connected to Home Assistant. You can now control your HA devices."
            : "Connect to your Home Assistant instance to sync devices and control them from here."}
        </p>
        <form
          onSubmit={handleHaConnect}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#999",
                fontSize: "0.875rem",
              }}
            >
              HA URL
            </label>
            <input
              type="url"
              placeholder="http://homeassistant:8123"
              value={haUrl}
              onChange={(e) => setHaUrl(e.target.value)}
              style={{ width: "100%" }}
              disabled={haConnected}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#999",
                fontSize: "0.875rem",
              }}
            >
              Long-Lived Access Token
            </label>
            <input
              type="password"
              placeholder="Paste your token"
              value={haToken}
              onChange={(e) => setHaToken(e.target.value)}
              style={{ width: "100%" }}
              disabled={haConnected}
            />
          </div>
          {haConnected ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleHaDisconnect}
              disabled={haLoading}
            >
              {haLoading ? "Loading..." : "Disconnect"}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={haLoading}
            >
              {haLoading ? "Connecting..." : "Connect"}
            </button>
          )}
        </form>
        {haConnected && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "rgba(0, 212, 170, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#00d4aa" }}>✓</span>
            <span style={{ color: "#00d4aa" }}>
              Connected to {haUrl}
            </span>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
          🎨 Appearance
        </h2>
        <p
          style={{ color: "#999", marginBottom: "1rem", fontSize: "0.875rem" }}
        >
          Choose your preferred theme. Changes apply immediately.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => toggleTheme("dark")}
            className={
              theme === "dark" ? "btn btn-primary" : "btn btn-secondary"
            }
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            disabled={themeLoading}
          >
            🌙 Dark Mode {theme === "dark" && "✓"}
          </button>
          <button
            onClick={() => toggleTheme("light")}
            className={
              theme === "light" ? "btn btn-primary" : "btn btn-secondary"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            disabled={themeLoading}
          >
            ☀️ Light Mode {theme === "light" && "✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
