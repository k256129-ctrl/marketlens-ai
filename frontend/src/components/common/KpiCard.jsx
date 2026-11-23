import React from "react";

export default function KpiCard({ title, value, subtitle, icon: Icon, accent = "emerald", badge }) {
  const colors = {
    emerald: { bg: "var(--color-primary-light)", fg: "var(--color-primary)" },
    coral: { bg: "var(--color-coral-bg)", fg: "var(--color-coral)" },
    amber: { bg: "var(--color-amber-bg)", fg: "var(--color-amber)" },
    blue: { bg: "var(--color-blue-bg)", fg: "var(--color-blue)" },
  };
  const theme = colors[accent] || colors.emerald;

  return (
    <div className="card card-hover" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            {title}
          </p>
          <h3 style={{ fontSize: "1.65rem", fontWeight: 800, marginTop: 8, color: "var(--color-text)" }}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: theme.bg,
              color: theme.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      {(subtitle || badge) && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <span>{subtitle}</span>
          {badge}
        </div>
      )}
    </div>
  );
}
