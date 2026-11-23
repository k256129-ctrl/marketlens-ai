import React, { useState, useEffect, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Ladies - Eastern & Kurtis");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("30");
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE}/api/inventory?limit=500`);
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/products?limit=500`);
      }
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.items || data.inventory || data.products || [];
        setItems(list);
      }
    } catch (err) {
      console.error("Inventory load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchSearch =
        !search.trim() ||
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.sku || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, categoryFilter, search]);

  const stats = useMemo(() => {
    const totalSkus = items.length;
    const totalUnits = items.reduce((acc, i) => acc + Number(i.stock ?? i.quantity ?? 0), 0);
    const totalValue = items.reduce(
      (acc, i) => acc + Number(i.price ?? 0) * Number(i.stock ?? i.quantity ?? 0),
      0
    );
    const lowStock = items.filter((i) => Number(i.stock ?? i.quantity ?? 0) < 15).length;
    return { totalSkus, totalUnits, totalValue, lowStock };
  }, [items]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory,
          price: Number(newPrice),
          stock: Number(newStock || 25),
          image_url:
            newImage.trim() ||
            "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80",
          description: `Verified ${newCategory} item added via Admin Inventory.`,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewPrice("");
        setNewStock("30");
        setNewImage("");
        setShowAddModal(false);
        await loadInventory();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap is product ko delete karna chahte hain?")) return;
    await fetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#F4F7FA", paddingBottom: "48px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #081220 0%, #0F233C 65%, #133152 100%)",
          color: "#FFFFFF",
          padding: "32px",
          borderRadius: "16px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#2BA6CB", textTransform: "uppercase", marginBottom: "6px" }}>
            ADMIN ENTERPRISE INVENTORY CONTROL
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFFFFF" }}>
            Ladies & Men Master Inventory ({items.length} Products)
          </h1>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={loadInventory}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "11px 18px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              background: "#2BA6CB",
              color: "#FFFFFF",
              border: "none",
              padding: "11px 22px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(43, 166, 203, 0.35)",
            }}
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* KPI SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Total Catalog SKUs</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0B192C", marginTop: "4px" }}>{stats.totalSkus}</div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Total Stock Units</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#2BA6CB", marginTop: "4px" }}>{stats.totalUnits.toLocaleString()}</div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Total Inventory Value</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0B192C", marginTop: "4px" }}>
            ${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Low Stock Alerts</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>{stats.lowStock}</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ background: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E2E8F0", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          className="input"
          style={{ flex: 1, minWidth: "240px" }}
          placeholder="Search SKU, Ladies/Men item name, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ width: "260px" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
          Showing {filteredItems.length} of {items.length} products
        </span>
      </div>

      {/* INVENTORY TABLE */}
      <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0", overflowX: "auto", boxShadow: "0 8px 24px rgba(11, 25, 44, 0.04)" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
            Loading 200 Ladies & Men products...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <h3 style={{ color: "#0B192C", marginBottom: "8px" }}>No Products Found</h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Filter reset karein ya Refresh dabayein.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#0B192C", color: "#FFFFFF", fontSize: "0.78rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 16px" }}>Product & Image</th>
                <th style={{ padding: "14px 16px" }}>SKU</th>
                <th style={{ padding: "14px 16px" }}>Category</th>
                <th style={{ padding: "14px 16px" }}>Retail Price</th>
                <th style={{ padding: "14px 16px" }}>Wholesale</th>
                <th style={{ padding: "14px 16px" }}>Stock</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const stock = Number(item.stock ?? item.quantity ?? 0);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #E2E8F0", fontSize: "0.88rem" }}>
                    <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: "1px solid #CBD5E1", flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#0B192C", color: "#2BA6CB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                          {(item.name || "PR").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontWeight: 700, color: "#0B192C" }}>{item.name}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748B", fontWeight: 600 }}>{item.sku || `ML-${item.id}`}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#E8F7FB", color: "#0B192C", padding: "4px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0B192C" }}>${Number(item.price ?? 0).toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2BA6CB" }}>
                      ${Number(item.bulk_price ?? Number(item.price ?? 0) * 0.84).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 700, background: stock < 15 ? "#FEF2F2" : "#ECFDF5", color: stock < 15 ? "#DC2626" : "#059669" }}>
                        {stock} units
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8, 18, 32, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0B192C", marginBottom: "16px" }}>
              Add New Ladies / Men Product
            </h2>
            <form onSubmit={handleAddProduct}>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Product Name *</label>
                <input type="text" className="input" placeholder="e.g. Royal Embroidered Velvet Shawl" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label className="label">Category *</label>
                <select className="select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Ladies - Eastern & Kurtis">Ladies - Eastern & Kurtis</option>
                  <option value="Ladies - Western & Tops">Ladies - Western & Tops</option>
                  <option value="Ladies - Handbags & Clutches">Ladies - Handbags & Clutches</option>
                  <option value="Ladies - Footwear & Heels">Ladies - Footwear & Heels</option>
                  <option value="Ladies - Jewelry & Watches">Ladies - Jewelry & Watches</option>
                  <option value="Ladies - Cosmetics & Skincare">Ladies - Cosmetics & Skincare</option>
                  <option value="Ladies - Abayas & Shawls">Ladies - Abayas & Shawls</option>
                  <option value="Men - Formal Suits & Blazers">Men - Formal Suits & Blazers</option>
                  <option value="Men - Casual Shirts & Polos">Men - Casual Shirts & Polos</option>
                  <option value="Men - Shalwar Kameez & Kurtas">Men - Shalwar Kameez & Kurtas</option>
                  <option value="Men - Denim & Trousers">Men - Denim & Trousers</option>
                  <option value="Men - Footwear & Sneakers">Men - Footwear & Sneakers</option>
                  <option value="Men - Watches & Wallets">Men - Watches & Wallets</option>
                  <option value="Men - Grooming & Fragrances">Men - Grooming & Fragrances</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label className="label">Retail Price ($ USD) *</label>
                  <input type="number" step="0.01" className="input" placeholder="75.00" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Initial Stock *</label>
                  <input type="number" className="input" value={newStock} onChange={(e) => setNewStock(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: "18px" }}>
                <label className="label">Product Image URL (Optional)</label>
                <input type="url" className="input" placeholder="https://images.unsplash.com/..." value={newImage} onChange={(e) => setNewImage(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2BA6CB", color: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}