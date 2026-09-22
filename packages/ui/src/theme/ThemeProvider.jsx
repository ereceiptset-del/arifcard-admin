import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "addiscard-theme";

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(preference) {
  return preference === "system" ? (systemPrefersDark() ? "dark" : "light") : preference;
}

function applyToDocument(resolved) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  // Set as an inline style so it can't lose to Tailwind's preflight in the
  // cascade. This is what paints the native viewport canvas (overscroll,
  // form controls, scrollbars) — the page background itself comes from the
  // shell's `bg-canvas dark:bg-canvas-dark` utilities.
  root.style.colorScheme = resolved === "dark" ? "dark" : "light";
}

/**
 * Theme preference: "light" | "dark" | "system".
 *
 * Only the preference is persisted — it is a display setting, not a
 * credential, so localStorage is appropriate here.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
      return "system";
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState(() => resolve(preference));

  useEffect(() => {
    const next = resolve(preference);
    setResolvedTheme(next);
    applyToDocument(next);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Storage unavailable (private mode) — the theme still applies for this session.
    }
  }, [preference]);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (preference !== "system") return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = resolve("system");
      setResolvedTheme(next);
      applyToDocument(next);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next) => setPreferenceState(next), []);
  const toggle = useCallback(
    () => setPreferenceState(resolve(preference) === "dark" ? "light" : "dark"),
    [preference]
  );

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
}
