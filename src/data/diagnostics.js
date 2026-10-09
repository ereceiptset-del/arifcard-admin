import { backendApi } from "@addiscard/services";

/**
 * Administrator: read-only receipt check, run by the backend this site talks
 * to. No claim, no payment decision. Rate-limited and audited on the server.
 */
export const diagnostics = {
  receipt: ({ method, token }) => backendApi.post("/admin/diagnostics/receipt", { method, token }, { auth: true }),
};

/** Plain words for each failure stage the backend reports. */
export const RECEIPT_STAGE_LABEL = {
  RECEIPT_VALIDATION_RESULT: "The bank answered and the receipt was read",
  LOCAL_VALIDATION_FAILURE: "The code is not in a receipt-code format (nothing was sent)",
  CONFIGURATION_MISSING: "This server is not configured for that bank",
  DNS_FAILURE: "The bank's address could not be looked up from this server",
  CONNECTION_TIMEOUT: "The bank did not answer in time",
  CONNECTION_REFUSED: "The connection to the bank was refused or unreachable",
  TLS_FAILURE: "The secure connection to the bank failed",
  CONNECTION_RESET: "The bank closed the connection",
  ADDRESS_REFUSED: "The bank's address resolved to a private address and was not used",
  UPSTREAM_HTTP_REFUSAL: "The bank answered with an error status",
  UNEXPECTED_CONTENT_TYPE: "The bank answered with a web page instead of receipt data",
  RESPONSE_SCHEMA_FAILURE: "The bank answered, but not with a readable receipt",
  NETWORK_FAILURE_OTHER: "The bank could not be reached (other network error)",
};
