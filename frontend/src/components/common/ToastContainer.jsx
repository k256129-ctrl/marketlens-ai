import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => {
        const isErr = t.type === "error";
        const isSuccess = t.type === "success";
        const accent = isErr
          ? "var(--color-coral)"
          : isSuccess
          ? "var(--color-primary)"
          : "var(--color-blue)";
        const Icon = isErr ? AlertCircle : isSuccess ? CheckCircle2 : Info;

        return (
          <div
            key={t.id}
            className="card"
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderLeft: `4px solid ${accent}`,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <Icon size={18} color={accent} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, flex: 1 }}>{t.message}</span>
            <button className="btn-ghost" style={{ padding: 4 }} onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
