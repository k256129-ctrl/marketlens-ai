import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  DollarSign,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Store,
} from "lucide-react";
import { api } from "../services/api";
import { useApp } from "../context/AppContext";
import KpiCard from "../components/common/KpiCard";
import Badge from "../components/common/Badge";
import { ErrorState, LoadingState } from "../components/common/DataState";
import CategoryChart from "../components/dashboard/CategoryChart";
import InventoryValueChart from "../components/dashboard/InventoryValueChart";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import { formatCurrency, formatNumber } from "../utils/formatters";

export default function Dashboard() {
  const { refreshAlertBadge } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const overview = await api.getDashboardOverview();
      setData(overview);
      refreshAlertBadge();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshAlertBadge]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <LoadingState message="Aggregating live commerce KPIs & inventory metrics..." />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const { kpis, category_distribution, business_performance, low_stock_alerts, recent_activities, analytical_insights } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Action Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
            Real-time operational telemetry across <strong>{kpis.total_businesses}</strong> businesses and{" "}
            <strong>{formatNumber(kpis.total_units_in_stock)}</strong> stocked units.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadDashboard}>
            <RefreshCw size={15} /> Refresh Data
          </button>
          <Link to="/app/inventory" className="btn btn-primary">
            Manage Inventory <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid-kpi">
        <KpiCard
          title="Total Businesses"
          value={formatNumber(kpis.total_businesses)}
          subtitle={`${kpis.active_businesses} active storefronts`}
          icon={Store}
          accent="emerald"
          badge={<Badge variant="success">Verified</Badge>}
        />
        <KpiCard
          title="Total Catalog Products"
          value={formatNumber(kpis.total_products)}
          subtitle={`${kpis.total_inventory_items} shop placements`}
          icon={PackageCheck}
          accent="blue"
        />
        <KpiCard
          title="Total Inventory Value"
          value={formatCurrency(kpis.total_inventory_value)}
          subtitle={`${formatNumber(kpis.total_units_in_stock)} total units`}
          icon={DollarSign}
          accent="emerald"
        />
        <KpiCard
          title="Low-Stock Products"
          value={formatNumber(kpis.low_stock_products + kpis.out_of_stock_products)}
          subtitle={`${kpis.out_of_stock_products} out of stock`}
          icon={AlertTriangle}
          accent={kpis.low_stock_products > 0 ? "coral" : "emerald"}
          badge={
            kpis.low_stock_products > 0 ? (
              <Badge variant="danger">Action Needed</Badge>
            ) : (
              <Badge variant="success">Healthy</Badge>
            )
          }
        />
      </div>

      {/* Analytical Decision-Support Summary Banner */}
      <div
        className="card"
        style={{
          padding: "18px 20px",
          background: "linear-gradient(90deg, var(--color-primary-light) 0%, var(--color-surface) 65%)",
          borderColor: "var(--color-primary-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Sparkles size={17} color="var(--color-primary)" />
          <h3 style={{ fontSize: "0.95rem", color: "var(--color-primary)" }}>
            Automated Analytical Summary (Database-Derived)
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {analytical_insights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.84rem",
                lineHeight: 1.5,
                color: "var(--color-text-secondary)",
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <InventoryValueChart data={business_performance} />
        <CategoryChart data={category_distribution} />
      </div>

      {/* Low Stock Priority Queue + Live Activity Stream */}
      <div className="grid-2">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: "1rem" }}>Low-Stock Replenishment Queue</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 3 }}>
                Items at or below minimum stock thresholds
              </p>
            </div>
            <Link to="/app/inventory" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-primary)" }}>
              Restock in Inventory →
            </Link>
          </div>

          {low_stock_alerts.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", padding: "24px 0" }}>
              All inventory items are adequately stocked above reorder thresholds.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Business</th>
                    <th>Stock / Min</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {low_stock_alerts.map((item) => (
                    <tr key={item.inventory_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.sku}</div>
                      </td>
                      <td>
                        <div>{item.business_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.city}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {item.quantity} / {item.min_stock_level}
                      </td>
                      <td>
                        <Badge variant={item.quantity === 0 ? "danger" : "warning"} dot>
                          {item.quantity === 0 ? "Out of Stock" : `-${item.deficit} deficit`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ActivityFeed activities={recent_activities} />
      </div>
    </div>
  );
}
