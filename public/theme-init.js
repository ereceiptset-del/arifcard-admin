// Runs in <head> before first paint:
// 1. Anti-flash theme. Mirrors ThemeContext's key and logic.
// 2. Starts the Geist stylesheet request. A stylesheet added by script does
//    not block rendering (as a static <link> it held up the first paint by
//    about a second on slow mobile connections). `display=optional` means
//    Geist is used when it arrives within the first ~100 ms (and on every
//    later visit, from cache); otherwise the system face stays for that page
//    view, so text never reflows when the font lands (no layout shift).
//    See docs/checkpoint-a.md, Lighthouse.
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

(function () {
  try {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=optional";
    document.head.appendChild(link);
  } catch (e) {
    /* Without it the system font stack is used. */
  }
})();
