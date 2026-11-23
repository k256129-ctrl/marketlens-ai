import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function InventoryFormModal({
  open,
  editingItem,
  businesses = [],
  products = [],
  categories = [],
  onSubmit,
  onClose,
}) {
  const [mode, setMode] = useState("existing"); // "existing" | "new_product"
  const [businessId, setBusinessId] = useState("");
  const [productId, setProductId] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newUnit, setNewUnit] = useState("unit");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("25");
  const [minStockLevel, setMinStockLevel] = useState("10");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editingItem) {
      setBusinessId(String(editingItem.business_id));
      setProductId(String(editingItem.product_id));
      setNewName(editingItem.product_name);
      setNewCategoryId(String(editingItem.category_id));
      setUnitPrice(String(editingItem.unit_price));
      setCostPrice(editingItem.cost_price !== null ? String(editingItem.cost_price) : "");
      setQuantity(String(editingItem.quantity));
      setMinStockLevel(String(editingItem.min_stock_level));
    } else {
      setMode("existing");
      setBusinessId(businesses[0] ? String(businesses[0].id) : "");
      setProductId(products[0] ? String(products[0].id) : "");
      setNewSku("");
      setNewName("");
      setNewBrand("");
      setNewUnit("unit");
      setNewCategoryId(categories[0] ? String(categories[0].id) : "");
      setUnitPrice("");
      setCostPrice("");
      setQuantity("25");
      setMinStockLevel("10");
    }
  }, [open, editingItem, businesses, products, categories]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedPrice = parseFloat(unitPrice);
    const parsedQty = parseInt(quantity, 10);
    const parsedMin = parseInt(minStockLevel, 10);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Unit selling price must be greater than $0.00.");
      return;
    }
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      setError("Quantity must be 0 or greater.");
      return;
    }
    if (Number.isNaN(parsedMin) || parsedMin < 0) {
      setError("Minimum stock level must be 0 or greater.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await onSubmit(
          {
            unit_price: parsedPrice,
            cost_price: costPrice !== "" ? parseFloat(costPrice) : null,
            quantity: parsedQty,
            min_stock_level: parsedMin,
            product_name: newName.trim(),
            category_id: Number(newCategoryId),
          },
          editingItem.id
        );
      } else if (mode === "existing") {
        if (!businessId || !productId) {
          setError("Please select both a business and a catalog product.");
          setSubmitting(false);
          return;
        }
        await onSubmit({
          business_id: Number(businessId),
          product_id: Number(productId),
          unit_price: parsedPrice,
          cost_price: costPrice !== "" ? parseFloat(costPrice) : null,
          quantity: parsedQty,
          min_stock_level: parsedMin,
        });
      } else {
        if (!businessId || !newSku.trim() || !newName.trim() || !newCategoryId) {
          setError("Business, SKU, product name, and category are required.");
          setSubmitting(false);
          return;
        }
        await onSubmit({
          business_id: Number(businessId),
          new_product_sku: newSku.trim().toUpperCase(),
          new_product_name: newName.trim(),
          new_product_brand: newBrand.trim() || null,
          new_product_unit: newUnit.trim() || "unit",
          new_product_category_id: Number(newCategoryId),
          unit_price: parsedPrice,
          cost_price: costPrice !== "" ? parseFloat(costPrice) : null,
          quantity: parsedQty,
          min_stock_level: parsedMin,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save inventory item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.15rem" }}>
            {editingItem ? "Edit Inventory Stock Record" : "Add Product to Business Inventory"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {!editingItem && (
          <div
            style={{
              display: "flex",
              gap: 8,
              background: "var(--color-surface-subtle)",
              padding: 4,
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              className={`btn ${mode === "existing" ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1, padding: "8px 12px" }}
              onClick={() => setMode("existing")}
            >
              Existing Catalog SKU
            </button>
            <button
              type="button"
              className={`btn ${mode === "new_product" ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1, padding: "8px 12px" }}
              onClick={() => setMode("new_product")}
            >
              Create New SKU + Stock
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "var(--color-coral-bg)",
              color: "var(--color-coral)",
              border: "1px solid rgba(232,89,74,0.35)",
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
          {!editingItem && (
            <div>
              <label className="label">Assigned Business / Shop *</label>
              <select className="select" value={businessId} onChange={(e) => setBusinessId(e.target.value)} required>
                <option value="">Select a business...</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!editingItem && mode === "existing" && (
            <div>
              <label className="label">Catalog Product *</label>
              <select className="select" value={productId} onChange={(e) => setProductId(e.target.value)} required>
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} ({p.category_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {(editingItem || mode === "new_product") && (
            <>
              <div className="grid-2">
                {!editingItem && (
                  <div>
                    <label className="label">Product SKU *</label>
                    <input
                      className="input"
                      placeholder="e.g., COF-209"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div style={{ gridColumn: editingItem ? "1 / -1" : "auto" }}>
                  <label className="label">Product Name *</label>
                  <input
                    className="input"
                    placeholder="e.g., Organic Cold Brew Concentrate"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="label">Category *</label>
                  <select
                    className="select"
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!editingItem && (
                  <div>
                    <label className="label">Brand & Unit</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="input"
                        placeholder="Brand"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                      />
                      <input
                        className="input"
                        style={{ width: 95 }}
                        placeholder="unit"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="grid-2">
            <div>
              <label className="label">Retail Unit Price (USD) *</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="24.99"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Wholesale Cost (Optional)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                placeholder="14.50"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="label">Stock Quantity *</label>
              <input
                className="input"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Minimum Reorder Threshold *</label>
              <input
                className="input"
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingItem ? "Save Changes" : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
