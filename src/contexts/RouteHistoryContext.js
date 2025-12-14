import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RouteHistoryContext = createContext(null);

export const RouteHistoryProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPath = location.pathname + location.search;

  const [historyStack, setHistoryStack] = useState(
    initialPath === "/" || initialPath === "/login" ? [] : [initialPath]
  );

  useEffect(() => {
    const current = location.pathname + location.search;

    if (current === "/" || current === "/login") {
      return;
    }

    setHistoryStack((prev) => {
      if (prev.length === 0) return [current];
      if (prev[prev.length - 1] === current) return prev;
      return [...prev, current];
    });
  }, [location.pathname, location.search]);

  const push = (to, options) => navigate(to, options);
  const go = (delta) => navigate(delta);
  const back = () => {
    if (historyStack.length > 1) {
      const prev = historyStack[historyStack.length - 2];

      setHistoryStack((s) => s.slice(0, s.length - 1));

      navigate(prev);
    } else {
      navigate(-1);
    }
  };

  const value = {
    history: historyStack,
    push,
    go,
    back,
    navigate, // expose raw navigate if needed
  };

  return (
    <RouteHistoryContext.Provider value={value}>
      {children}
    </RouteHistoryContext.Provider>
  );
};

export const useRouteHistory = () => {
  const ctx = useContext(RouteHistoryContext);
  if (!ctx)
    throw new Error("useRouteHistory must be used within RouteHistoryProvider");
  return ctx;
};
