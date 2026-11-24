import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

function formatPKR(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export default function ProductFinder({ isAdmin }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Shopping Mall Filter & Sort States
  const [budgetMode, setBudgetMode] = useState("all"); // "all" | "less" | "more"
  const [budget, setBudget] = useState(50000);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured"); // "featured" | "price_asc" | "price_desc" | "rating_desc"
  const [discountedOnly, setDiscountedOnly] = useState(false);

  // Quick-View Modal & Pagination
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [brokenImages, setBrokenImages] = useState({});

  const adminAccess = useMemo(() => {
    if (typeof isAdmin === "boolean") return isAdmin;
    try {
      const saved = JSON.parse(localStorage.getItem("marketlenz_user"));
      const r = (saved?.role || "").toLowerCase();
      return r.includes("admin") || r.includes("owner") || r.includes("manager");
    } catch {
      return false;
    }
  }, [isAdmin]);

  useEffect(() => {
    let active = true;
    async function fetchCatalog() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/products?limit=600`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.items || data.products || [];
        if (active) setProducts(list);
      } catch {
        if (active) {
          setError("Could not connect to backend API. Ensure FastAPI server is running on port 8000.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchCatalog();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return [
      { name: "All", count: products.length },
      ...Object.keys(counts).map((name) => ({ name, count: counts[name] })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const price = Number(p.price ?? p.retail_price ?? 0);
      const origPrice = Number(p.original_price ?? 0);
      const hasDiscount = origPrice > price || Number(p.discount_percent ?? 0) > 0;

      const matchesBudget =
        budgetMode === "all" || !budget
          ? true
          : budgetMode === "less"
          ? price <= Number(budget)
          : price >= Number(budget);

      const matchesCategory = category === "All" || p.category === category;
      const matchesDiscount = !discountedOnly || hasDiscount;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      return matchesBudget && matchesCategory && matchesDiscount && matchesSearch;
    });

    if (sortBy === "price_asc") {
      return [...filtered].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    }
    if (sortBy === "price_desc") {
      return [...filtered].sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    }
    if (sortBy === "rating_desc") {
      return [...filtered].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    }
    return filtered;
  }, [products, budgetMode, budget, category, discountedOnly, searchQuery, sortBy]);

  useEffect(() => {
    setVisibleCount(24);
  }, [budgetMode, budget, category, discountedOnly, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setBudgetMode("all");
    setBudget(50000);
    setCategory("All");
    setSearchQuery("");
    setSortBy("featured");
    setDiscountedOnly(false);
  };

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#F1F5F9", paddingBottom: "56px" }}>
      <style>{`
        .ml-mall-layout {
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .ml-mall-layout {
            grid-template-columns: 1fr;
          }
          .ml-dept-sidebar {
            display: none !important;
          }
        }
        .ml-store-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1320px) {
          .ml-store-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 760px) {
          .ml-store-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 460px) {
          .ml-store-grid {
            grid-template-columns: 1fr;
          }
        }
        .ml-product-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .ml-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(11, 25, 44, 0.1);
          border-color: #2BA6CB;
        }
        .ml-product-card:hover .ml-card-img {
          transform: scale(1.05);
        }
        .ml-card-img {
          transition: transform 0.28s ease;
        }
        .ml-dept-btn {
          width: 100%;
          text-align: left;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.14s ease;
        }
        .ml-dept-btn:hover {
          background: #F1F5F9;
          color: #0B192C;
        }
        .ml-dept-btn.active {
          background: #0B192C;
          color: #FFFFFF;
          font-weight: 700;
        }
      `}</style>

      {/* 1. DARAZ / AMAZON STYLE TOP MARKETPLACE HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #081220 0%, #0F233C 65%, #133152 100%)",
          color: "#FFFFFF",
          padding: "26px 28px 28px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 12px 30px rgba(11, 25, 44, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#5CE1E6",
                marginBottom: "4px",
              }}
            >
              {adminAccess
                ? `MARKETLENZ AI MALL • ADMIN CATALOG (${products.length} ITEMS)`
                : `MARKETLENZ AI ONLINE MALL • ${products.length} VERIFIED PRODUCTS`}
            </span>
            <h1 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.95rem)", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              Shop Across 20+ Categories in Pakistan (PKR)
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/app/locations")}
            style={{
              background: "rgba(43, 166, 203, 0.2)",
              color: "#5CE1E6",
              border: "1px solid rgba(43, 166, 203, 0.45)",
              padding: "9px 16px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Find Nearest Store →
          </button>
        </div>

        {/* Search + Category Dropdown + PKR Budget + Sort */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.08)",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <input
            type="text"
            placeholder="Search iPhone, Laptop, Lawn Suit, Shoes, Watch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              gridColumn: "span 2",
              minWidth: "210px",
              height: "42px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.9rem",
              background: "#FFFFFF",
              color: "#0B192C",
              outline: "none",
            }}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              height: "42px",
              padding: "0 12px",
              borderRadius: "8px",
              border: "none",
              background: "#FFFFFF",
              color: "#0B192C",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name === "All" ? `All Departments (${c.count})` : `${c.name} (${c.count})`}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "6px" }}>
            <select
              value={budgetMode}
              onChange={(e) => setBudgetMode(e.target.value)}
              style={{
                height: "42px",
                padding: "0 8px",
                borderRadius: "8px",
                border: "none",
                background: "#E8F7FB",
                color: "#0B192C",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <option value="all">Any PKR</option>
              <option value="less">Under Rs.</option>
              <option value="more">Over Rs.</option>
            </select>

            <input
              type="number"
              min="0"
              step="500"
              disabled={budgetMode === "all"}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="PKR"
              style={{
                width: "100%",
                height: "42px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.88rem",
                background: budgetMode === "all" ? "#CBD5E1" : "#FFFFFF",
                color: "#0B192C",
                fontWeight: 600,
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              height: "42px",
              padding: "0 12px",
              borderRadius: "8px",
              border: "none",
              background: "#FFFFFF",
              color: "#0B192C",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <option value="featured">Sort: Featured Mall</option>
            <option value="price_asc">Price: Low to High (PKR)</option>
            <option value="price_desc">Price: High to Low (PKR)</option>
            <option value="rating_desc">Top Rated (★)</option>
          </select>
        </div>
      </div>

      {/* 2. MALL WORKSPACE: DEPARTMENT SIDEBAR + PRODUCT GRID */}
      <div className="ml-mall-layout">
        {/* LEFT DEPARTMENT BROWSER (20 CATEGORIES) */}
        <aside
          className="ml-dept-sidebar"
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            padding: "16px",
            position: "sticky",
            top: "16px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#0B192C",
              paddingBottom: "10px",
              marginBottom: "10px",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            Shopping Departments ({categories.length - 1})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxHeight: "72vh", overflowY: "auto" }}>
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`ml-dept-btn ${category === c.name ? "active" : ""}`}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    background: category === c.name ? "rgba(43, 166, 203, 0.25)" : "#F1F5F9",
                    color: category === c.name ? "#5CE1E6" : "#64748B",
                    flexShrink: 0,
                  }}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT PRODUCT GRID AREA */}
        <div>
          {/* Results Status Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: "#FFFFFF",
              padding: "12px 18px",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>
              {loading ? (
                "Loading 500 shopping mall products..."
              ) : (
                <>
                  Showing <strong style={{ color: "#0B192C" }}>{visibleProducts.length}</strong> of{" "}
                  <strong style={{ color: "#0B192C" }}>{filteredProducts.length}</strong> products
                  {category !== "All" && (
                    <span>
                      {" "}
                      in <strong style={{ color: "#2BA6CB" }}>{category}</strong>
                    </span>
                  )}
                </>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={discountedOnly}
                  onChange={(e) => setDiscountedOnly(e.target.checked)}
                  style={{ accentColor: "#2BA6CB", width: "15px", height: "15px" }}
                />
                Discounted Deals Only
              </label>

              {(category !== "All" || searchQuery || budgetMode !== "all" || discountedOnly) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    background: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    color: "#0B192C",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#B91C1C",
                padding: "16px 20px",
                borderRadius: "12px",
                marginBottom: "18px",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="ml-store-grid">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    height: "365px",
                    padding: "14px",
                  }}
                >
                  <div style={{ height: "200px", background: "#E2E8F0", borderRadius: "8px", marginBottom: "14px" }} />
                  <div style={{ height: "16px", width: "85%", background: "#E2E8F0", borderRadius: "4px", marginBottom: "10px" }} />
                  <div style={{ height: "22px", width: "50%", background: "#E2E8F0", borderRadius: "4px" }} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                padding: "54px 24px",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "1.18rem", fontWeight: 700, color: "#0B192C", marginBottom: "8px" }}>
                No Products Matched Your Filter
              </h3>
              <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "18px" }}>
                Try another search term, switch departments, or reset your PKR price range.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: "#2BA6CB",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Browse All 500 Products
              </button>
            </div>
          ) : (
            <>
              {/* DARAZ / AMAZON E-COMMERCE PRODUCT GRID */}
              <div className="ml-store-grid">
                {visibleProducts.map((product) => {
                  const price = Number(product.price ?? product.retail_price ?? 0);
                  const origPrice = Number(product.original_price ?? 0);
                  const discountPct =
                    Number(product.discount_percent ?? 0) ||
                    (origPrice > price && price > 0
                      ? Math.round(((origPrice - price) / origPrice) * 100)
                      : 0);
                  const hasDiscount = discountPct > 0 && origPrice > price;
                  const rating = Number(product.rating ?? 0);
                  const reviews = Number(product.review_count ?? 0);
                  const stock = Number(product.stock ?? product.quantity ?? 0);
                  const hasImg = Boolean(product.image_url) && !brokenImages[product.id];

                  return (
                    <article key={product.id} className="ml-product-card">
                      {/* Image Container */}
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "205px",
                          backgroundColor: "#F8FAFC",
                          overflow: "hidden",
                          cursor: "pointer",
                          borderBottom: "1px solid #F1F5F9",
                        }}
                      >
                        {hasImg ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            className="ml-card-img"
                            onError={() =>
                              setBrokenImages((prev) => ({ ...prev, [product.id]: true }))
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(135deg, #0B192C 0%, #163254 100%)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2BA6CB",
                            }}
                          >
                            <span style={{ fontSize: "1.7rem", fontWeight: 800 }}>
                              {(product.name || "ML").slice(0, 2).toUpperCase()}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: "4px" }}>
                              {product.sku}
                            </span>
                          </div>
                        )}

                        {hasDiscount && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "#DC2626",
                              color: "#FFFFFF",
                              fontSize: "0.71rem",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.35)",
                            }}
                          >
                            -{discountPct}% OFF
                          </span>
                        )}

                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: stock > 0 ? "rgba(11, 25, 44, 0.84)" : "rgba(185, 28, 28, 0.9)",
                            color: stock > 0 ? "#5CE1E6" : "#FFFFFF",
                            fontSize: "0.67rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {stock > 0 ? (adminAccess ? `${stock} left` : "In Stock") : "Sold Out"}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div
                        style={{
                          padding: "13px 14px 15px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.69rem",
                            fontWeight: 700,
                            color: "#2BA6CB",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "4px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.category}
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(product)}
                          title={product.name}
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            color: "#0B192C",
                            lineHeight: 1.35,
                            marginBottom: "7px",
                            cursor: "pointer",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "2.42rem",
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Rating & Reviews */}
                        {rating > 0 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "0.76rem",
                              marginBottom: "8px",
                            }}
                          >
                            <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                              {"★".repeat(Math.round(rating))}
                              {"☆".repeat(Math.max(0, 5 - Math.round(rating)))}
                            </span>
                            <span style={{ color: "#0B192C", fontWeight: 700 }}>{rating.toFixed(1)}</span>
                            <span style={{ color: "#64748B" }}>({reviews})</span>
                          </div>
                        )}

                        {/* PKR Price & Original Strikethrough */}
                        <div style={{ marginTop: "auto", paddingTop: "4px" }}>
                          <div style={{ fontSize: "1.18rem", fontWeight: 800, color: "#0B192C" }}>
                            {formatPKR(price)}
                          </div>

                          {hasDiscount && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#94A3B8",
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatPKR(origPrice)}
                              </span>
                              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#DC2626" }}>
                                -{discountPct}%
                              </span>
                            </div>
                          )}

                          {adminAccess && product.bulk_price > 0 && (
                            <div style={{ fontSize: "0.72rem", color: "#0284C7", fontWeight: 600, marginTop: "3px" }}>
                              Wholesale: {formatPKR(product.bulk_price)}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "7px",
                            marginTop: "11px",
                            paddingTop: "11px",
                            borderTop: "1px solid #F1F5F9",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => navigate("/app/locations")}
                            style={{
                              background: "#2BA6CB",
                              color: "#FFFFFF",
                              border: "none",
                              padding: "8px 10px",
                              borderRadius: "7px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Find In Store →
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            style={{
                              background: "#F1F5F9",
                              color: "#0B192C",
                              border: "1px solid #CBD5E1",
                              padding: "8px 10px",
                              borderRadius: "7px",
                              fontSize: "0.76rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* LOAD MORE PAGINATION */}
              {visibleCount < filteredProducts.length && (
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    style={{
                      background: "#0B192C",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "12px 28px",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(11, 25, 44, 0.16)",
                    }}
                  >
                    Load More Products ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. PRODUCT QUICK-VIEW MODAL */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 18, 32, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "740px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <div style={{ background: "#0B192C", minHeight: "300px" }}>
              {selectedProduct.image_url && !brokenImages[selectedProduct.id] ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  style={{ width: "100%", height: "100%", maxHeight: "380px", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    minHeight: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2BA6CB",
                    fontSize: "2.2rem",
                    fontWeight: 800,
                  }}
                >
                  {(selectedProduct.name || "ML").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ padding: "26px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#2BA6CB", textTransform: "uppercase" }}>
                  {selectedProduct.category} • {selectedProduct.sku}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#0B192C",
                  }}
                >
                  ✕
                </button>
              </div>

              <h2 style={{ fontSize: "1.32rem", fontWeight: 800, color: "#0B192C", margin: "8px 0 8px" }}>
                {selectedProduct.name}
              </h2>

              {Number(selectedProduct.rating) > 0 && (
                <div style={{ fontSize: "0.84rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                    {"★".repeat(Math.round(selectedProduct.rating))}
                  </span>
                  <strong style={{ color: "#0B192C" }}>{Number(selectedProduct.rating).toFixed(1)}</strong>
                  <span style={{ color: "#64748B" }}>({selectedProduct.review_count} verified reviews)</span>
                </div>
              )}

              <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
                {selectedProduct.description}
              </p>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "18px",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>Mall Price (PKR)</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "2px" }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0B192C" }}>
                    {formatPKR(selectedProduct.price)}
                  </span>
                  {Number(selectedProduct.original_price) > Number(selectedProduct.price) && (
                    <span style={{ fontSize: "0.92rem", color: "#94A3B8", textDecoration: "line-through" }}>
                      {formatPKR(selectedProduct.original_price)}
                    </span>
                  )}
                </div>

                {adminAccess && (
                  <div style={{ fontSize: "0.8rem", color: "#0284C7", fontWeight: 700, marginTop: "6px" }}>
                    Wholesale: {formatPKR(selectedProduct.bulk_price)} • Stock: {selectedProduct.stock} units
                  </div>
                )}
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    navigate("/app/locations");
                  }}
                  style={{
                    flex: 1,
                    background: "#2BA6CB",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "11px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Locate Nearest Shop →
                </button>

                {adminAccess && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      navigate("/app/inventory");
                    }}
                    style={{
                      background: "#0B192C",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "11px 16px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Manage Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}