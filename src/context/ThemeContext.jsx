// Imported from the module, not the package index, so the first-load bundle
// carries the theme provider only — not the whole component library.
import { ThemeProvider as UiThemeProvider, useTheme as useUiTheme } from "@addiscard/ui/theme/ThemeProvider.jsx";

/**
 * The site's theme is the design system's theme: one provider, one
 * storage key (`addiscard-theme`), applied before first paint by
 * `public/theme-init.js`. This module keeps the older `{ theme, setTheme }`
 * names for the marketing and sign-in components that use them.
 */
export const ThemeProvider = UiThemeProvider;

export function useTheme() {
  const { preference, resolvedTheme, setPreference } = useUiTheme();
  return { theme: preference, resolvedTheme, setTheme: setPreference };
}
