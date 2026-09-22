import { ApiError } from "./apiClient.js";

export const FEATURE_UNAVAILABLE = "FEATURE_UNAVAILABLE";

/**
 * Raised by a service whose backend does not exist yet.
 *
 * The alternative — returning invented balances or fabricated records —
 * would make an unbuilt feature look finished. A screen that catches this
 * says plainly that the feature is not available, and shows nothing that
 * could be mistaken for the customer's real data.
 */
export function unavailable(feature) {
  return () =>
    Promise.reject(
      new ApiError(`${feature} is not available yet.`, { code: FEATURE_UNAVAILABLE, status: 501 })
    );
}

/** True when a screen should render "not available yet" rather than an error. */
export function isUnavailable(error) {
  return error?.code === FEATURE_UNAVAILABLE;
}
