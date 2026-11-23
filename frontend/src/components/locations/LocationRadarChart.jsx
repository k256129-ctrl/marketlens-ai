import React, { useState, useEffect, useRef } from "react";

export default function LocationFinder() {
  const [mode, setMode] = useState("shops"); // "shops" | "business"
  const [query, setQuery] = useState("Electronics");
  const [cityInput, setCityInput] = useState("Karachi");
  const [coords, setCoords] = useState({ lat: 24.8607, lng: 67.0011 }); // Default: Karachi
  const [radius, setRadius] = useState(3000); // meters
  const [results, setResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Distance calculator (Haversine formula in KM)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markersLayerRef.current = window.L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
  }, []);

  // Update map markers whenever coords or results change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || !window.L) return;

    layer.clearLayers();
    map.setView([coords.lat, coords.lng], 13);

    // User / Target Center Marker
    window.L.circleMarker([coords.lat, coords.lng], {
      radius: 9,
      fillColor: "#087F5B",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1,
    })
      .bindPopup("<b>Your Selected Location</b>")
      .addTo(layer);

    // Search Radius Circle
    window.L.circle([coords.lat, coords.lng], {
      radius: Number(radius),
      color: "#087F5B",
      fillColor: "#087F5B",
      fillOpacity: 0.08,
      weight: 1,
    }).addTo(layer);

    // Result Markers
    results.forEach((place) => {
      window.L.marker([place.lat, place.lng])
        .bindPopup(
          `<b>${place.name}</b><br/>${place.category}<br/>Distance: ${place.distance} km`
        )
        .addTo(layer);
    });
  }, [coords, results, radius]);

  // Use Live Browser GPS
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Aapka browser GPS support nahi karta.");
      return;
    }
    setStatusMsg("Live location detect ho rahi hai...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        setCityInput("My Current GPS Location");
        setStatusMsg("Live location set ho gayi hai!");
      },
      () => {
        setStatusMsg("GPS permission deny hui. Neeche area/city ka naam likh kar search karein.");
      }
    );
  };

  // Convert Area/City Name to Coordinates (Nominatim Free Geocoding)
  const resolveLocation = async () => {
    if (!cityInput || cityInput === "My Current GPS Location") return coords;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&limit=1`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const updated = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      setCoords(updated);
      return updated;
    }
    return coords;
  };

  // Main Search Function (Overpass OpenStreetMap Live Data)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMsg("");
    setAnalysis(null);

    try {
      const target = await resolveLocation();
      const qLower = query.toLowerCase();

      // Smart OSM Tag Mapping
      let osmFilter = `["shop"]`;
      if (qLower.includes("cafe") || qLower.includes("coffee") || qLower.includes("restaurant") || qLower.includes("food")) {
        osmFilter = `["amenity"~"cafe|restaurant|fast_food"]`;
      } else if (qLower.includes("pharmacy") || qLower.includes("medical") || qLower.includes("medicine")) {
        osmFilter = `["amenity"="pharmacy"]`;
      } else if (qLower.includes("electronic") || qLower.includes("mobile") || qLower.includes("laptop") || qLower.includes("computer")) {
        osmFilter = `["shop"~"electronics|mobile_phone|computer"]`;
      } else if (qLower.includes("grocery") || qLower.includes("supermarket") || qLower.includes("mart")) {
        osmFilter = `["shop"~"supermarket|convenience|general"]`;
      } else if (qLower.includes("cloth") || qLower.includes("fashion") || qLower.includes("garment")) {
        osmFilter = `["shop"~"clothes|boutique|shoes"]`;
      }

      const overpassQuery = `
        [out:json][timeout:15];
        (
          node${osmFilter}(around:${radius},${target.lat},${target.lng});
          way${osmFilter}(around:${radius},${target.lat},${target.lng});
        );
        out center 25;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });
      const data = await response.json();

      const formatted = (data.elements || [])
        .map((el, idx) => {
          const lat = el.lat || el.center?.lat;
          const lng = el.lon || el.center?.lon;
          if (!lat || !lng) return null;

          const tags = el.tags || {};
          const name = tags.name || `${query} Store #${idx + 1}`;
          const category = tags.shop || tags.amenity || query;
          const address =
            [tags["addr:street"], tags["addr:suburb"], tags["addr:city"]]
              .filter(Boolean)
              .join(", ") || cityInput;

          return {
            id: el.id || idx,
            name,
            category: category.replace("_", " ").toUpperCase(),
            address,
            phone: tags.phone || tags["contact:phone"] || "Not listed",
            lat,
            lng,
            distance: getDistanceKm(target.lat, target.lng, lat, lng),
          };
        })
        .filter(Boolean)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      setResults(formatted);

      // Business Opportunity Analysis Logic
      if (mode === "business") {
        const count = formatted.length;
        let score = 85;
        let verdict = "High Opportunity Zone";
        let advice =
          "Is ilaqay mein competition kam hai aur demand ke liye strong space maujood hai. Naya business start karne ke liye ideal jagah hai.";

        if (count >= 15) {
          score = 54;
          verdict = "High Competition (Saturated)";
          advice =
            "Yahan pehle se kaafi zyada similar shops maujood hain. Kamyabi ke liye unique pricing ya specialized products rakhne honge.";
        } else if (count >= 6) {
          score = 78;
          verdict = "Balanced Commercial Hub";
          advice =
            "Yeh ek active commercial zone hai jahan customers pehle se aate hain. Achi branding ke saath yahan business jaldi grow karega.";
        } else if (count === 0) {
          score = 68;
          verdict = "Untapped / Emerging Area";
          advice =
            "Is radius mein koi direct competitor nahi mila. Pehle check karein ke aas-paas residential population aur footfall maujood hai.";
        }

        setAnalysis({
          competitors: count,
          score,
          verdict,
          advice,
          radiusKm: (radius / 1000).toFixed(1),
        });
      }

      if (formatted.length === 0) {
        setStatusMsg("Is radius mein koi shop nahi mili. Radius barha kar (e.g. 5 km) dobara search karein.");
      }
    } catch (err) {
      setStatusMsg("Network error: Location data fetch karne mein masla aaya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [mode]);

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.65rem", marginBottom: "4px" }}>
            Smart Location & Market Finder
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Qareebi product shops dhoondhein ya naye business ke liye best location analyze karein
          </p>
        </div>

        {/* Mode Tabs */}
        <div
          style={{
            display: "flex",
            background: "var(--color-surface)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("shops")}
            className={mode === "shops" ? "btn btn-primary" : "btn btn-ghost"}
          >
            Find Product Shops
          </button>
          <button
            type="button"
            onClick={() => setMode("business")}
            className={mode === "business" ? "btn btn-primary" : "btn btn-ghost"}
          >
            New Business Spot Analyzer
          </button>
        </div>
      </div>

      {/* Search & Filter Control Card */}
      <form
        onSubmit={handleSearch}
        className="card"
        style={{
          padding: "20px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px",
          alignItems: "end",
        }}
      >
        <div>
          <label className="label">
            {mode === "shops" ? "Product / Shop Category" : "Apna Naya Business Type"}
          </label>
          <input
            type="text"
            className="input"
            placeholder={
              mode === "shops"
                ? "e.g. Electronics, Laptop, Pharmacy, Grocery"
                : "e.g. Cafe, Electronics Store, Garments"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Area / City Name</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="input"
              placeholder="e.g. Gulshan-e-Iqbal, Karachi"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleUseGPS}
              className="btn btn-secondary"
              title="Use Live GPS Location"
            >
              GPS
            </button>
          </div>
        </div>

        <div>
          <label className="label">Search Radius</label>
          <select
            className="select"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={1000}>1 km (Walking Distance)</option>
            <option value={3000}>3 km (Nearby Area)</option>
            <option value={5000}>5 km (City Zone)</option>
            <option value={10000}>10 km (Wide Search)</option>
          </select>
        </div>

        <div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading
              ? "Scanning Area..."
              : mode === "shops"
              ? "Find Nearby Shops"
              : "Analyze Business Location"}
          </button>
        </div>
      </form>

      {statusMsg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-amber-bg)",
            color: "var(--color-amber)",
            fontSize: "0.875rem",
            fontWeight: 500,
            marginBottom: "18px",
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Business Suitability Score Panel (Only in Business Mode) */}
      {mode === "business" && analysis && (
        <div
          className="card"
          style={{
            padding: "20px",
            marginBottom: "20px",
            borderLeft: "5px solid var(--color-primary)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--color-primary)",
              }}
            >
              Location Suitability Score
            </span>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "4px" }}>
              {analysis.score} / 100
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 600,
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              {analysis.verdict}
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Existing Competitors ({analysis.radiusKm} km radius)
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "4px" }}>
              {analysis.competitors} Shops Found
            </div>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>AI Market Recommendation:</div>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
              {analysis.advice}
            </p>
          </div>
        </div>
      )}

      {/* Split View: Interactive Map + Results List */}
      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Live Map Card */}
        <div className="card" style={{ overflow: "hidden", height: "500px" }}>
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Shops / Competitors List */}
        <div className="card" style={{ padding: "20px", maxHeight: "500px", overflowY: "auto" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "14px" }}>
            {mode === "shops"
              ? `Nearby Available Shops (${results.length})`
              : `Existing Competitors in Area (${results.length})`}
          </h3>

          {results.length === 0 && !loading ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Koi result nahi mila. Upar area ka naam ya radius change karke search karein.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {results.map((shop) => (
                <div
                  key={shop.id}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{shop.name}</strong>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "var(--color-primary-light)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {shop.distance} km
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-secondary)",
                        marginTop: "4px",
                      }}
                    >
                      {shop.category} • {shop.address}
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: "0.78rem", padding: "7px 12px" }}
                  >
                    Directions
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}