import React from "react";

const STYLES = {
  success: {
    background: "var(--color-primary-light)",
    color: "var(--color-primary)",
    border: "1px solid var(--color-primary-border)",
  },
  warning: {
    background: "var(--color-amber-bg)",
    color: "var(--color-amber)",
    border: "1px solid rgba(217, 119, 6, 0.3)",
  },
  danger: {
    background: "var(--color-coral-bg)",
    color: "var(--color-coral)",
    border: "1px solid rgba(232, 89, 74, 0.35)",
  },
  info: {
    background: "var(--color-blue-bg)",
    color: "var(--color-blue)",
    border: "1px solid rgba(37, 99, 235, 0.3)",
  },
  neutral: {
    background: "var(--color-surface-subtle)",
    color: "var(--color-text-secondary)",
    border: "1px solid var(--color-border)",
  },
};

export default function Badge({ children, variant = "neutral", dot = false }) {
  const style = STYLES[variant] || STYLES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: style.color,
          }}
        />
      )}
      {children}
    </span>
  );
}
