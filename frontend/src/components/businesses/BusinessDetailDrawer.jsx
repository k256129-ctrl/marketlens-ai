import React from "react";
import { Mail, MapPin, Phone, Star, User, X } from "lucide-react";
import Badge from "../common/Badge";
import { formatCurrency, getStockBadgeMeta } from "../../utils/formatters";

export default function BusinessDetailDrawer({ business, onClose }) {
  if (!business) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 740 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge variant={business.status === "active" ? "success" : "warning"} dot>
                {business.status.toUpperCase()}
              </Badge>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{business.category}</span>
            </div>
            <h3 style={{ fontSize: "1.3rem", marginTop: 6 }}>{business.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: 4 }}>
              {business.description || "Commercial merchant operating on MarketLens AI."}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Contact & Location Metadata */}
        <div
          className="grid-2"
          style={{
            background: "var(--color-surface-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 14,
            fontSize: "0.82rem",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color="var(--color-primary)" /> {business.address} ({business.district})
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <User size={14} color="var(--color-primary)" /> Lead: {business.owner_name || "Unassigned"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Phone size={14} color="var(--color-primary)" /> {business.phone || "No phone listed"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={14} color="var(--color-primary)" /> {business.email || "No email listed"} •{" "}
              <Star size={13} color="#D97706" fill="#D97706" /> {business.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Associated Inventory Table */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ fontSize: "0.95rem" }}>
            Associated Store Inventory ({business.inventory?.length || 0} SKUs)
          </h4>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>
            Total Valuation: {formatCurrency(business.inventory_value)}
          </span>
        </div>

        {!business.inventory || business.inventory.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "16px 0" }}>
            No inventory items assigned to this shop yet. Add stock from the Inventory module.
          </p>
        ) : (
          <div className="table-wrapper" style={{ border: "1px solid var(--color-border)", borderRadius: 10 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {business.inventory.map((inv) => {
                  const badge = getStockBadgeMeta(inv.stock_status);
                  return (
                    <tr key={inv.inventory_id}>
                      <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{inv.sku}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.product_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{inv.category_name}</div>
                      </td>
                      <td>{formatCurrency(inv.unit_price)}</td>
                      <td>
                        {inv.quantity} {inv.unit}
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(inv.total_value)}</td>
                      <td>
                        <Badge variant={badge.variant} dot>
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
