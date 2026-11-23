import React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

export default function CategoryChart({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: "1rem" }}>Inventory Value by Category</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 3 }}>
          Capital allocation across product verticals
        </p>
      </div>

      <div style={{ height: 240, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="inventory_value"
              nameKey="category_name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.category_id} fill={entry.color_hex || "#087F5B"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                fontSize: "0.82rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {data.map((cat) => (
          <div
            key={cat.category_id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.82rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cat.color_hex,
                }}
              />
              <span style={{ color: "var(--color-text-secondary)" }}>{cat.category_name}</span>
            </div>
            <span style={{ fontWeight: 700 }}>{formatCurrency(cat.inventory_value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
