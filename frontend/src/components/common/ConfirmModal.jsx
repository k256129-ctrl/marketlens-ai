import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Confirm Deletion",
  message,
  confirmLabel = "Delete Record",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-panel" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--color-coral-bg)",
                color: "var(--color-coral)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: "1.05rem" }}>{title}</h3>
          </div>
          <button className="btn-ghost" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: 22 }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
