import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AppShell({ user, isAdmin, onLogout }) {
  const navigate = useNavigate();

  // Fallback check if AppShell is rendered without props
  const currentUser =
    user ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("marketlenz_user"));
      } catch {
        return null;
      }
    })();

  const adminAccess =
    typeof isAdmin === "boolean"
      ? isAdmin
      : Boolean(
          currentUser?.role &&
            (currentUser.role.toLowerCase().includes("admin") ||
              currentUser.role.toLowerCase().includes("owner") ||
              currentUser.role.toLowerCase().includes("manager"))
        );

  // Customer ko sirf Product Finder aur Location Finder dikhega
  const navItems = adminAccess
    ? [
        { to: "/app/dashboard", label: "Dashboard", tag: "ADMIN" },
        { to: "/app/products", label: "Product Finder" },
        { to: "/app/locations", label: "Location Finder" },
        { to: "/app/inventory", label: "Inventory" },
        { to: "/app/businesses", label: "Businesses" },
      ]
    : [
        { to: "/app/products", label: "Product Finder" },
        { to: "/app/locations", label: "Location Finder" },
      ];

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("marketlenz_user");
    }
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F7FA" }}>
      {/* LEFT CORPORATE SIDEBAR */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#0B192C",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 18px",
          flexShrink: 0,
          borderRight: "1px solid rgba(43, 166, 203, 0.2)",
        }}
      >
        <div>
          {/* Brand Logo */}
          <div
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              padding: "6px 12px 22px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: "22px",
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              <span style={{ color: "#FFFFFF" }}>Marketlenz</span>{" "}
              <span style={{ color: "#2BA6CB" }}>AI</span>
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#94A3B8",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              {adminAccess ? "Admin Control Panel" : "Customer Portal"}
            </div>
          </div>

          {/* Role-Filtered Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#FFFFFF" : "#CBD5E1",
                  backgroundColor: isActive ? "#2BA6CB" : "transparent",
                  boxShadow: isActive ? "0 6px 16px rgba(43, 166, 203, 0.3)" : "none",
                  transition: "all 0.15s ease",
                })}
              >
                <span>{item.label}</span>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "2px 7px",
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontWeight: 700,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile & Actions */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {currentUser && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "10px 12px",
                borderRadius: "10px",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: "0.74rem", color: "#2BA6CB", fontWeight: 600 }}>
                ID: {currentUser.userId} • {adminAccess ? "Admin" : "User"}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "transparent",
              color: "#E2E8F0",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back to Home
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "rgba(239, 68, 68, 0.18)",
              color: "#FCA5A5",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}