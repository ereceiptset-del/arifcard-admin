// Anti-flash theme: applied before first paint. Mirrors ThemeContext's key and logic.
(function () {
  try {
    var STORAGE_KEY = "addiscard-theme";
    var stored = localStorage.getItem(STORAGE_KEY) || "system";
    var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored === "dark" || (stored === "system" && systemPrefersDark);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {
    /* localStorage or matchMedia unavailable (e.g. privacy mode) — fall back to light. */
  }
})();
