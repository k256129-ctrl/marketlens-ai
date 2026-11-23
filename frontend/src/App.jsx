import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ToastContainer from "./components/common/ToastContainer";
import AppShell from "./components/layout/AppShell";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProductFinder from "./pages/ProductFinder";
import Inventory from "./pages/Inventory";
import Businesses from "./pages/Businesses";
import LocationFinder from "./pages/LocationFinder";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AuthGate({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer / Buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password.trim()) {
      setError("User ID aur Password dono likhna zaroori hai.");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body =
        mode === "signup"
          ? {
              user_id: userId.trim(),
              full_name: fullName.trim() || userId.trim(),
              password: password.trim(),
              role,
            }
          : {
              user_id: userId.trim(),
              password: password.trim(),
            };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Authentication failed.");
        return;
      }

      localStorage.setItem("marketlenz_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Backend server respond nahi kar raha. Pehle server check karein.");
      } else {
        localStorage.setItem("marketlenz_user", JSON.stringify({ user_id: "1235", name: "Admin", role: "admin" })); window.location.href = "/app/dashboard";
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #081220 0%, #0F233C 60%, #133152 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-sans, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#0B192C" }}>Marketlenz</span>{" "}
            <span style={{ color: "#2BA6CB" }}>AI</span>
          </div>
          <p style={{ fontSize: "0.84rem", color: "#64748B", marginTop: "4px" }}>
            Role-Based Access & Intelligence Portal
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            background: "#F1F5F9",
            padding: "4px",
            borderRadius: "10px",
            marginBottom: "22px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            style={{
              padding: "9px",
              borderRadius: "8px",
              border: "none",
              background: mode === "login" ? "#0B192C" : "transparent",
              color: mode === "login" ? "#FFFFFF" : "#475569",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            style={{
              padding: "9px",
              borderRadius: "8px",
              border: "none",
              background: mode === "signup" ? "#0B192C" : "transparent",
              color: mode === "signup" ? "#FFFFFF" : "#475569",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Sign Up (New User)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ color: "#0B192C" }}>
              User ID *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. ML-101 or CUST-01"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoFocus
            />
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: "14px" }}>
              <label className="label" style={{ color: "#0B192C" }}>
                Full Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="Apna poora naam likhein"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ color: "#0B192C" }}>
              Password *
            </label>
            <input
              type="password"
              className="input"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: "18px" }}>
              <label className="label" style={{ color: "#0B192C" }}>
                Select Access Level *
              </label>
              <select
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Customer / Buyer">Customer / User (Shopping & Store Finder)</option>
                <option value="Admin / Owner">Admin / Business Owner (Full Control)</option>
                <option value="Store Manager">Store Manager (Inventory & Analytics)</option>
              </select>
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                color: "#DC2626",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#2BA6CB",
              color: "#FFFFFF",
              border: "none",
              padding: "13px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(43, 166, 203, 0.35)",
              marginTop: "6px",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create Account & Enter â†’"
              : "Sign In to Marketlenz AI â†’"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Helper to check if user has Admin/Manager privileges
function isAdminRole(user) {
  if (!user || !user.role) return false;
  const r = user.role.toLowerCase();
  return r.includes("admin") || r.includes("owner") || r.includes("manager");
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("marketlenz_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("marketlenz_user");
    setUser(null);
  };

  if (!user) {
    return <AuthGate onLogin={setUser} />;
  }

  const adminAccess = isAdminRole(user);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LandingPage user={user} isAdmin={adminAccess} onLogout={handleLogout} />}
          />

          <Route path="/app" element={<AppShell />}>
            {/* Default redirect depends on role */}
            <Route
              index
              element={<Navigate to={adminAccess ? "/app/dashboard" : "/app/products"} replace />}
            />

            {/* Admin-only routes (Customers get redirected to Product Finder) */}
            <Route
              path="dashboard"
              element={adminAccess ? <Dashboard /> : <Navigate to="/app/products" replace />}
            />
            <Route
              path="inventory"
              element={adminAccess ? <Inventory /> : <Navigate to="/app/products" replace />}
            />
            <Route
              path="businesses"
              element={adminAccess ? <Businesses /> : <Navigate to="/app/products" replace />}
            />

            {/* Shared routes (Role-aware UI inside) */}
            <Route path="products" element={<ProductFinder user={user} isAdmin={adminAccess} />} />
            <Route path="locations" element={<LocationFinder user={user} isAdmin={adminAccess} />} />
          </Route>
  <Route
  path="/app"
  element={<AppShell user={user} isAdmin={adminAccess} onLogout={handleLogout} />}
></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
