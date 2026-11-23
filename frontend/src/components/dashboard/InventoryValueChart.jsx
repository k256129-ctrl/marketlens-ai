import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

export default function InventoryValueChart({ data = [] }) {
  const formatted = data.map((b) => ({
    ...b,
    shortName: b.business_name.split(" ").slice(0, 2).join(" "),
  }));

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: "1rem" }}>Business Inventory Valuation</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 3 }}>
          Stock asset value and unit volume per registered shop
        </p>
      </div>

      <div style={{ height: 300, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "inventory_value" ? [formatCurrency(value), "Inventory Value"] : [value, "Units"]
              }
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                fontSize: "0.82rem",
              }}
            />
            <Bar dataKey="inventory_value" fill="#087F5B" radius={[8, 8, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
