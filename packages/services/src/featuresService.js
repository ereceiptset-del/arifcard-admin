import { backendApi } from "./backendApi.js";

/**
 * Which features the server says are available.
 *
 * The UI never decides this. It asks the backend and renders whatever it
 * is told, so a paused integration reads the same everywhere and cannot
 * drift out of step with what the backend actually refuses.
 */
export const featuresService = {
  list: (options) => backendApi.get("/features", options),
};

export const FEATURE_STATE = {
  ENABLED: "enabled",
  ON_HOLD: "on_hold",
  NOT_CONFIGURED: "not_configured",
};
