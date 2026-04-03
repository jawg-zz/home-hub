"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/devices", label: "Devices", icon: "💡" },
  { href: "/household", label: "Household", icon: "👨‍👩‍👧‍👦" },
  { href: "/security", label: "Security", icon: "🔒" },
  { href: "/energy", label: "Energy", icon: "⚡" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardNav({
  children,
  session,
  signOutAction,
}: {
  children: ReactNode;
  session: { user?: { name?: string | null; email?: string | null } } | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle escape key to close mobile menu
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsClosing(true);
        setTimeout(() => {
          setIsMobileMenuOpen(false);
          setIsClosing(false);
        }, 300);
      }
    },
    [isMobileMenuOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Close menu on route change
  useEffect(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  }, [pathname]);

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() =>
          isMobileMenuOpen ? closeMenu() : setIsMobileMenuOpen(true)
        }
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-sidebar"
        style={{
          display: "none",
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 10001,
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          padding: "0.75rem",
          cursor: "pointer",
          color: "#e0e0e0",
          fontSize: "1.25rem",
          width: "44px",
          height: "44px",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        className="mobile-menu-btn"
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px #00d4aa";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transform: isMobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* Mobile Backdrop */}
      {(isMobileMenuOpen || isClosing) && (
        <div
          onClick={closeMenu}
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 9998,
            animation: isClosing
              ? "fadeOut 0.3s ease forwards"
              : "fadeIn 0.2s ease",
          }}
          className="mobile-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`sidebar ${isMobileMenuOpen ? "sidebar-open" : ""} ${isClosing ? "sidebar-closing" : ""}`}
        style={{
          width: "260px",
          background: "#0f0f0f",
          borderRight: "1px solid #1a1a1a",
          padding: "1.5rem",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          zIndex: 9999,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>🏠</span>
            <span
              style={{
                background: "linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Home Hub
            </span>
          </Link>
        </div>

        <nav style={{ marginBottom: "2rem" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  color: isActive ? "#00d4aa" : "#888",
                  background: isActive
                    ? "rgba(0, 212, 170, 0.1)"
                    : "transparent",
                  textDecoration: "none",
                  marginBottom: "0.25rem",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#e0e0e0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#888";
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px #00d4aa";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "1.5rem",
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#0f0f0f",
              }}
            >
              {session?.user?.name?.[0] || "U"}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {session?.user?.name || "User"}
              </div>
              <div style={{ color: "#666", fontSize: "0.75rem" }}>
                {session?.user?.email}
              </div>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.5rem",
                background: "transparent",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#666",
                fontSize: "0.875rem",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ff6b35";
                e.currentTarget.style.color = "#ff6b35";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2a";
                e.currentTarget.style.color = "#666";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px #00d4aa";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        style={{
          flex: 1,
          marginLeft: "260px",
          padding: "2rem",
          background: "#0a0a0a",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }

          .mobile-backdrop {
            display: block !important;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-open {
            transform: translateX(0);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-closing {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          main {
            margin-left: 0 !important;
            padding: 4rem 1rem 1rem !important;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
