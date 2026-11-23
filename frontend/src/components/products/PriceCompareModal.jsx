import React from "react";
import { MapPin, Star, Store, X } from "lucide-react";
import Badge from "../common/Badge";
import { formatCurrency, getStockBadgeMeta } from "../../utils/formatters";

export default function PriceCompareModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <Badge variant="success">{product.category_name}</Badge>
            <h3 style={{ fontSize: "1.2rem", marginTop: 8 }}>{product.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              SKU: <strong>{product.sku}</strong> • Brand: {product.brand || "Generic"} • Unit: {product.unit}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Price Summary Strip */}
        <div
          className="grid-3"
          style={{
            background: "var(--color-surface-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-muted)" }}>Lowest Market Price</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-primary)" }}>
              {formatCurrency(product.min_price)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-muted)" }}>Average Price</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>{formatCurrency(product.avg_price)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-muted)" }}>Price Spread</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-amber)" }}>
              {formatCurrency(product.price_spread)}
            </div>
          </div>
        </div>

        <h4 style={{ fontSize: "0.9rem", marginBottom: 10 }}>
          Available Merchant Listings ({product.offers.length})
        </h4>

        {product.offers.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No shops currently stock this product.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {product.offers.map((offer, idx) => {
              const badge = getStockBadgeMeta(offer.stock_status);
              return (
                <div
                  key={offer.inventory_id}
                  style={{
                    border: idx === 0 ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: idx === 0 ? "var(--color-primary-light)" : "var(--color-surface)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Store size={15} color="var(--color-primary)" />
                      <strong>{offer.business_name}</strong>
                      {idx === 0 && <Badge variant="success">Best Price</Badge>}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} /> {offer.district}, {offer.city}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Star size={12} color="#D97706" fill="#D97706" /> {offer.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                        {formatCurrency(offer.unit_price)}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
                        {offer.quantity} {product.unit}(s) available
                      </div>
                    </div>
                    <Badge variant={badge.variant} dot>
                      {badge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
