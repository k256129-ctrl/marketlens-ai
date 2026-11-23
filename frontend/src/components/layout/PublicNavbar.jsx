import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowRight, Sun, Moon } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function PublicNavbar() {
  const { theme, toggleTheme } = useApp();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #087F5B 0%, #0CA678 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.12rem" }}>
              MarketLens <span style={{ color: "var(--color-primary)" }}>AI</span>
            </span>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 24 }} className="desktop-nav">
          <a href="#features" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Capabilities
          </a>
          <a href="#preview" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Live Platform
          </a>
          <a href="#benefits" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Enterprise Value
          </a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link to="/app/dashboard" className="btn btn-primary">
            Open Workspace <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
