import React, { useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://").replace(/\/$/, "");

export default function LandingPage({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [recoveryPin, setRecoveryPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const completeSession = (userObj, token) => {
    localStorage.setItem("marketlenz_user", JSON.stringify(userObj));
    localStorage.setItem("marketlenz_token", token);
    if (typeof onLogin === "function") {
      onLogin(userObj);
    } else {
      window.location.href = userObj.role === "admin" ? "/app/dashboard" : "/app/products";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanId = userId.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanId,
            user_id: cleanId,
            recovery_pin: recoveryPin.trim(),
            new_password: cleanPass,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "Unable to reset password. Check User ID and Recovery PIN.");
        }
        setSuccessMsg("Password updated successfully! Please Sign In with your new password.");
        setMode("signin");
        setPassword("");
        setRecoveryPin("");
        return;
      }

      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? {
              user_id: cleanId,
              username: cleanId,
              email: cleanId,
              password: cleanPass,
              full_name: fullName.trim() || cleanId,
              recovery_pin: recoveryPin.trim() || "1234",
              role: "customer",
            }
          : {
              user_id: cleanId,
              username: cleanId,
              email: cleanId,
              password: cleanPass,
            };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Authentication failed. Please check your credentials.");
      }

      const userSession = {
        user_id: data.user?.user_id || data.user?.email || cleanId,
        name: data.user?.name || data.user?.full_name || fullName.trim() || cleanId,
        role: (data.user?.role || "customer").toLowerCase(),
      };

      completeSession(userSession, data.access_token || data.token || "ml-jwt-session");
    } catch (err) {
      setErrorMsg(err.message || "Server is waking up (may take 30s on first visit). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#08172E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "430px", backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0B192C", margin: 0 }}>
            Marketlenz <span style={{ color: "#2BA6CB" }}>AI</span>
          </h1>
          <p style={{ fontSize: "0.84rem", color: "#64748B", marginTop: "6px" }}>
            Smart Retail & Multi-Category Shopping Platform
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px", marginBottom: "22px" }}>
          <button type="button" onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }} style={{ padding: "10px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", backgroundColor: mode === "signin" ? "#08172E" : "transparent", color: mode === "signin" ? "#FFFFFF" : "#475569" }}>
            Sign In
          </button>
          <button type="button" onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }} style={{ padding: "10px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", backgroundColor: mode === "signup" ? "#08172E" : "transparent", color: mode === "signup" ? "#FFFFFF" : "#475569" }}>
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>Full Name *</label>
              <input type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#EEF4FA", fontSize: "0.92rem", color: "#0B192C", outline: "none" }} />
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>User ID or Email *</label>
            <input type="text" placeholder="Enter your User ID or Email" value={userId} onChange={(e) => setUserId(e.target.value)} required style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#EEF4FA", fontSize: "0.92rem", color: "#0B192C", outline: "none" }} />
          </div>

          {(mode === "signup" || mode === "forgot") && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                {mode === "signup" ? "Set 4-Digit Recovery PIN (for password reset) *" : "Your 4-Digit Recovery PIN *"}
              </label>
              <input type="text" placeholder="e.g. 4589" value={recoveryPin} onChange={(e) => setRecoveryPin(e.target.value)} required style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#EEF4FA", fontSize: "0.92rem", color: "#0B192C", outline: "none" }} />
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
              {mode === "forgot" ? "New Password *" : "Password *"}
            </label>
            <input type="password" placeholder="Enter password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#EEF4FA", fontSize: "0.92rem", color: "#0B192C", outline: "none" }} />
          </div>

          {mode === "signin" && (
            <div style={{ textAlign: "right", marginBottom: "18px" }}>
              <button type="button" onClick={() => { setMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }} style={{ background: "none", border: "none", color: "#2BA6CB", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                Forgot Password?
              </button>
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", padding: "11px 14px", borderRadius: "8px", fontSize: "0.83rem", fontWeight: 600, marginBottom: "16px" }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "11px 14px", borderRadius: "8px", fontSize: "0.83rem", fontWeight: 600, marginBottom: "16px" }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", backgroundColor: "#2BA6CB", color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1 }}>
            {loading ? "Please wait..." : mode === "signup" ? "Create Account →" : mode === "forgot" ? "Reset Password →" : "Sign In →"}
          </button>

          {mode === "forgot" && (
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <button type="button" onClick={() => { setMode("signin"); setErrorMsg(""); }} style={{ background: "none", border: "none", color: "#475569", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}