/**
 * `npm test` builds first, then checks what would be deployed.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkBundle } from "../scripts/check-bundle.mjs";

test("the built admin app holds the console and nothing from the customer site", () => {
  assert.deepEqual(checkBundle(), []);
});

test("hosting config serves only the admin target, routes /api before the SPA fallback, and sets a CSP", () => {
  const config = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(config), ["hosting"], "no functions, rules or other targets in the admin release");
  const h = config.hosting;
  assert.equal(h.target, "admin");
  assert.equal(h.public, "dist");
  assert.equal(h.rewrites[0].source, "/api/**");
  assert.equal(h.rewrites[0].function.functionId, "api");
  assert.equal(h.rewrites.at(-1).source, "**");
  const headers = h.headers.find((x) => x.source === "**").headers;
  const csp = headers.find((x) => x.key === "Content-Security-Policy")?.value || "";
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval/);

  const rc = JSON.parse(readFileSync(new URL("../.firebaserc", import.meta.url), "utf8"));
  assert.deepEqual(rc.targets, { "addiscard-1a9bc": { hosting: { admin: ["arifcard-admin-1a9bc"] } } }, "admin maps to the admin site only");
});
