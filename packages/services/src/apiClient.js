/**
 * The error type every service throws.
 *
 * Screens branch on `instanceof ApiError` and read `message`, `code` and
 * `problems`, so both the backend client (backendApi.js) and the local
 * store raise this same class.
 */
export class ApiError extends Error {
  constructor(message, { status, code, problems } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.problems = problems;
  }
}
