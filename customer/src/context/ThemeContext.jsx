import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "addiscard-theme";
const ThemeContext = createContext(null);

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyResolvedTheme(theme) {
  const isDark = theme === "dark" || (theme === "system" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
  return isDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() => applyResolvedTheme(theme));

  useEffect(() => {
    setResolvedTheme(applyResolvedTheme(theme));
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(applyResolvedTheme("system"));
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}