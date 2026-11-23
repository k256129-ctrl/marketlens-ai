import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatters";

export default function ActivityFeed({ activities = [] }) {
  const iconFor = (severity) => {
    switch (severity) {
      case "success":
        return { Icon: CheckCircle2, color: "var(--color-primary)", bg: "var(--color-primary-light)" };
      case "warning":
        return { Icon: AlertTriangle, color: "var(--color-amber)", bg: "var(--color-amber-bg)" };
      case "danger":
        return { Icon: Trash2, color: "var(--color-coral)", bg: "var(--color-coral-bg)" };
      default:
        return { Icon: Info, color: "var(--color-blue)", bg: "var(--color-blue-bg)" };
    }
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: "1rem" }}>Live Audit & Activity Stream</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 3 }}>
            Real-time database mutations & threshold alerts
          </p>
        </div>
        <Activity size={18} color="var(--color-primary)" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activities.map((item) => {
          const { Icon, color, bg } = iconFor(item.severity);
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                paddingBottom: 12,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: bg,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontSize: "0.84rem", fontWeight: 600 }}>{item.title}</p>
                  <span style={{ fontSize: "0.74rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
                {item.detail && (
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: 2 }}>
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
