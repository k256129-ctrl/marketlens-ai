import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  category: "Organic Grocery & Deli",
  city: "",
  district: "",
  address: "",
  owner_name: "",
  phone: "",
  email: "",
  status: "active",
  rating: 4.7,
  description: "",
};

export default function BusinessFormModal({ open, editingBusiness, onSubmit, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editingBusiness) {
      setForm({
        name: editingBusiness.name || "",
        category: editingBusiness.category || "",
        city: editingBusiness.city || "",
        district: editingBusiness.district || "",
        address: editingBusiness.address || "",
        owner_name: editingBusiness.owner_name || "",
        phone: editingBusiness.phone || "",
        email: editingBusiness.email || "",
        status: editingBusiness.status || "active",
        rating: editingBusiness.rating ?? 4.5,
        description: editingBusiness.description || "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, editingBusiness]);

  if (!open) return null;

  const updateField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.city.trim() || !form.district.trim() || !form.address.trim()) {
      setError("Business name, city, district, and street address are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          ...form,
          rating: Number(form.rating),
        },
        editingBusiness?.id
      );
      onClose();
    } catch (err) {
      setError(err.message || "Unable to save business profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.15rem" }}>
            {editingBusiness ? "Edit Business Profile" : "Register New Business / Shop"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "var(--color-coral-bg)",
              color: "var(--color-coral)",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: "0.84rem",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-2">
            <div>
              <label className="label">Business / Shop Name *</label>
              <input
                className="input"
                placeholder="e.g., Verdant Roasters & Market"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Commercial Sector *</label>
              <input
                className="input"
                placeholder="e.g., Specialty Retail"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="label">City *</label>
              <input
                className="input"
                placeholder="Austin"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Neighborhood / District *</label>
              <input
                className="input"
                placeholder="South Congress"
                value={form.district}
                onChange={(e) => updateField("district", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Full Street Address *</label>
            <input
              className="input"
              placeholder="1200 Main St, Suite 100"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              required
            />
          </div>

          <div className="grid-3">
            <div>
              <label className="label">Manager / Owner</label>
              <input
                className="input"
                placeholder="Full name"
                value={form.owner_name}
                onChange={(e) => updateField("owner_name", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="pending">Pending Onboarding</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="label">Store Rating (0–5)</label>
              <input
                className="input"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => updateField("rating", e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="label">Contact Phone</label>
              <input
                className="input"
                placeholder="+1 (555) 010-2030"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Operations Email</label>
              <input
                className="input"
                type="email"
                placeholder="ops@store.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Storefront Profile Notes</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Brief overview of storefront positioning and product mix..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingBusiness ? "Update Business" : "Create Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
