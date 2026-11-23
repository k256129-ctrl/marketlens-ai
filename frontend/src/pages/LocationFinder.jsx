import React, { useCallback, useEffect, useState } from "react";
import { Award, Building2, Info, MapPin, Search, TrendingUp } from "lucide-react";
import { api } from "../services/api";
import Badge from "../components/common/Badge";
import { EmptyState, ErrorState, LoadingState } from "../components/common/DataState";
import LocationRadarChart from "../components/locations/LocationRadarChart";
import { formatCurrency } from "../utils/formatters";

export default function LocationFinder() {
  const [locations, setLocations] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [competition, setCompetition] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [locList, compData] = await Promise.all([
        api.getLocations({
          search,
          city,
          competition_level: competition,
        }),
        api.compareLocations(selectedIds),
      ]);
      setLocations(locList);
      setComparison(compData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, city, competition, selectedIds]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const competitionVariant = (level) => {
    switch (level) {
      case "Low":
        return "success";
      case "Moderate":
        return "info";
      case "High":
        return "warning";
      default:
        return "danger";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Methodology Transparency Callout */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          background: "var(--color-amber-bg)",
          borderColor: "rgba(217, 119, 6, 0.35)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Info size={19} color="var(--color-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "0.84rem", lineHeight: 1.5, color: "var(--color-text)" }}>
          <strong>Data Transparency Notice:</strong> Commercial rent estimates, foot-traffic indices, and opportunity
          scores tagged <Badge variant="warning">ILLUSTRATIVE ESTIMATE</Badge> are modeled decision-support benchmarks
          stored in the MarketLens database—not live brokerage/MLS feeds.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ position: "relative" }}>
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
              placeholder="Search corridor, sector, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All Metro Markets</option>
            <option value="Austin">Austin, TX</option>
            <option value="Seattle">Seattle, WA</option>
            <option value="Chicago">Chicago, IL</option>
            <option value="Denver">Denver, CO</option>
          </select>

          <select className="select" value={competition} onChange={(e) => setCompetition(e.target.value)}>
            <option value="">All Competition Levels</option>
            <option value="Low">Low Competition</option>
            <option value="Moderate">Moderate Competition</option>
            <option value="High">High Competition</option>
            <option value="Saturated">Saturated</option>
          </select>

          {selectedIds.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setSelectedIds([])}>
              Clear Comparison Selection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Evaluating commercial zones and opportunity scores..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadLocations} />
      ) : locations.length === 0 ? (
        <EmptyState
          title="No commercial areas match your filters"
          description="Broaden your city or competition filter to compare all benchmarked zones."
        />
      ) : (
        <>
          {/* Recommended Top Opportunity Highlight */}
          {comparison && comparison.recommended_area !== "N/A" && (
            <div
              className="card"
              style={{
                padding: 20,
                background: "linear-gradient(90deg, var(--color-primary-light) 0%, var(--color-surface) 70%)",
                borderColor: "var(--color-primary-border)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "var(--color-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  TOP RANKED EXPANSION CANDIDATE {selectedIds.length > 0 ? "(FROM SELECTED)" : ""}
                </div>
                <h3 style={{ fontSize: "1.1rem", marginTop: 2 }}>{comparison.recommended_area}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: 4 }}>
                  {comparison.recommendation_reason}
                </p>
              </div>
            </div>
          )}

          {/* Multi-Factor Chart */}
          <LocationRadarChart locations={selectedIds.length > 0 ? comparison.locations : locations} />

          {/* Area Analysis Cards */}
          <div className="grid-3">
            {locations.map((loc) => {
              const isSelected = selectedIds.includes(loc.id);
              return (
                <div
                  key={loc.id}
                  className="card card-hover"
                  style={{
                    padding: 20,
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <Badge variant="warning">Illustrative Estimate</Badge>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          color: "var(--color-primary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <TrendingUp size={15} /> {loc.opportunity_score}/100
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.08rem", marginTop: 10 }}>{loc.area_name}</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={13} /> {loc.city}
                      </span>
                      <span>•</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Building2 size={13} /> {loc.zone_type}
                      </span>
                    </div>

                    {/* Metrics Grid */}
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
                        fontSize: "0.82rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Est. Monthly Rent</div>
                        <div style={{ fontWeight: 800, fontSize: "1rem" }}>
                          {formatCurrency(loc.avg_monthly_rent_usd)}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                          ~${loc.rent_per_sqft_usd}/sq ft
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Competition</div>
                        <div style={{ marginTop: 3 }}>
                          <Badge variant={competitionVariant(loc.competition_level)}>
                            {loc.competition_level} ({loc.competition_index}/100)
                          </Badge>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: 4 }}>
                          Foot Traffic: {loc.foot_traffic_score}/100
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, fontSize: "0.8rem" }}>
                      <strong style={{ color: "var(--color-text-secondary)" }}>Best-Fit Sectors: </strong>
                      <span style={{ color: "var(--color-text)" }}>{loc.best_fit_sectors}</span>
                    </div>

                    <p style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", marginTop: 8, lineHeight: 1.45 }}>
                      {loc.source_note}
                    </p>
                  </div>

                  <button
                    className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                    style={{ width: "100%" }}
                    onClick={() => toggleSelect(loc.id)}
                  >
                    {isSelected ? "Selected in Comparison" : "Select to Compare"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
