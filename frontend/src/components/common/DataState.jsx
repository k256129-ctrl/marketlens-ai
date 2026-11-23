import React from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";

export function LoadingState({ message = "Loading live workspace data..." }) {
  return (
    <div
      className="card"
      style={{
        padding: "56px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Loader2 size={30} color="var(--color-primary)" className="spin-icon" />
      <p style={{ fontWeight: 600, color: "var(--color-text)" }}>{message}</p>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        Querying FastAPI relational backend...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin-icon { animation: spin 0.9s linear infinite; }`}</style>
    </div>
  );
}

export function ErrorState({ title = "Unable to load data", message, onRetry }) {
  return (
    <div
      className="card"
      style={{
        padding: "44px 24px",
        textAlign: "center",
        borderColor: "rgba(232, 89, 74, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--color-coral-bg)",
          color: "var(--color-coral)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3 style={{ fontSize: "1.1rem" }}>{title}</h3>
      <p style={{ maxWidth: 480, fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {message || "An API request failed. Ensure the FastAPI backend is running on http://localhost:8000."}
      </p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: 6 }}>
          <RefreshCw size={15} /> Retry Connection
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No records found", description, action }) {
  return (
    <div
      className="card"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "12px",
          background: "var(--color-surface-subtle)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inbox size={22} />
      </div>
      <h4 style={{ fontSize: "1rem" }}>{title}</h4>
      {description && (
        <p style={{ maxWidth: 440, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
