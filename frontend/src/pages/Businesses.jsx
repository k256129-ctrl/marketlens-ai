import React, { useCallback, useEffect, useState } from "react";
import { Edit3, Eye, MapPin, Plus, Search, Star, Store, Trash2 } from "lucide-react";
import { api } from "../services/api";
import { useApp } from "../context/AppContext";
import Badge from "../components/common/Badge";
import ConfirmModal from "../components/common/ConfirmModal";
import { EmptyState, ErrorState, LoadingState } from "../components/common/DataState";
import BusinessFormModal from "../components/businesses/BusinessFormModal";
import BusinessDetailDrawer from "../components/businesses/BusinessDetailDrawer";
import { formatCurrency } from "../utils/formatters";

export default function Businesses() {
  const { addToast, refreshAlertBadge } = useApp();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState(null);
  const [detailBiz, setDetailBiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getBusinesses({
        search,
        city,
        status: statusFilter,
      });
      setBusinesses(data);
      refreshAlertBadge();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, city, statusFilter, refreshAlertBadge]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleSaveBusiness = async (payload, id) => {
    if (id) {
      await api.updateBusiness(id, payload);
      addToast("Business profile updated successfully.", "success");
    } else {
      await api.createBusiness(payload);
      addToast("New business registered on MarketLens AI.", "success");
    }
    await loadBusinesses();
  };

  const handleViewDetail = async (bizId) => {
    try {
      const detail = await api.getBusinessDetail(bizId);
      setDetailBiz(detail);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteBusiness(deleteTarget.id);
      addToast(`Deleted business '${deleteTarget.name}'.`, "info");
      setDeleteTarget(null);
      await loadBusinesses();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filter & Create Header */}
      <div className="card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1 }}>
            <div style={{ position: "relative", minWidth: 230, flex: 1 }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                className="input"
                style={{ paddingLeft: 33 }}
                placeholder="Search shop name, district, or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className="select" style={{ width: 170 }} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All Cities</option>
              <option value="Austin">Austin</option>
              <option value="Seattle">Seattle</option>
              <option value="Chicago">Chicago</option>
              <option value="Denver">Denver</option>
            </select>

            <select
              className="select"
              style={{ width: 165 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingBiz(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> Register Business
          </button>
        </div>
      </div>

      {/* Business Directory Grid */}
      {loading ? (
        <LoadingState message="Loading registered businesses and shop valuations..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBusinesses} />
      ) : businesses.length === 0 ? (
        <EmptyState
          title="No businesses found"
          description="Register a new local storefront or adjust your search filters."
          action={
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingBiz(null);
                setFormOpen(true);
              }}
            >
              <Plus size={15} /> Register First Business
            </button>
          }
        />
      ) : (
        <div className="grid-3">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="card card-hover"
              style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Badge variant={biz.status === "active" ? "success" : "warning"} dot>
                    {biz.status}
                  </Badge>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.82rem", fontWeight: 700 }}>
                    <Star size={14} color="#D97706" fill="#D97706" /> {biz.rating.toFixed(1)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Store size={19} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem" }}>{biz.name}</h3>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{biz.category}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 12,
                  }}
                >
                  <MapPin size={14} color="var(--color-primary)" />
                  <span>
                    {biz.district}, {biz.city}
                  </span>
                </div>

                {/* Shop Inventory KPIs */}
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--color-surface-subtle)",
                    border: "1px solid var(--color-border)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Tracked Products</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                      {biz.total_products} SKUs ({biz.total_units}u)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Stock Value</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-primary)" }}>
                      {formatCurrency(biz.inventory_value)}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
                  onClick={() => handleViewDetail(biz.id)}
                >
                  <Eye size={14} /> View Inventory
                </button>
                <button
                  className="btn-ghost"
                  title="Edit business"
                  onClick={() => {
                    setEditingBiz(biz);
                    setFormOpen(true);
                  }}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="btn-ghost"
                  title="Delete business"
                  style={{ color: "var(--color-coral)" }}
                  onClick={() => setDeleteTarget(biz)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BusinessFormModal
        open={formOpen}
        editingBusiness={editingBiz}
        onSubmit={handleSaveBusiness}
        onClose={() => setFormOpen(false)}
      />

      <BusinessDetailDrawer business={detailBiz} onClose={() => setDetailBiz(null)} />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Business & Associated Stock"
        message={
          deleteTarget
            ? `Deleting "${deleteTarget.name}" will permanently remove the storefront and its ${deleteTarget.total_products} associated inventory record(s). Continue?`
            : ""
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
