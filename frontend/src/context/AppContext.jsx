import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("ml_theme") || "light");
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    checking: true,
    dialect: "sqlite",
    version: "1.0.0",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ml_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setApiStatus({
        connected: Boolean(health?.database_connected),
        checking: false,
        dialect: health?.database_dialect || "sqlite",
        version: health?.version || "1.0.0",
      });
    } catch {
      setApiStatus((prev) => ({ ...prev, connected: false, checking: false }));
    }
  }, []);

  const refreshAlertBadge = useCallback(async () => {
    try {
      const overview = await api.getDashboardOverview();
      const count =
        (overview?.kpis?.low_stock_products || 0) +
        (overview?.kpis?.out_of_stock_products || 0);
      setLowStockCount(count);
    } catch {
      // Handled gracefully by individual page error states
    }
  }, []);

  useEffect(() => {
    checkHealth();
    refreshAlertBadge();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, [checkHealth, refreshAlertBadge]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        apiStatus,
        checkHealth,
        globalSearch,
        setGlobalSearch,
        lowStockCount,
        refreshAlertBadge,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
