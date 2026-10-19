import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Customers → Account access (backend/docs/ACCOUNT_ACCESS.md). The backend
 * enforces role, state and version; these pin the screen to the same
 * contract so it cannot drift into offering what the backend refuses.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const component = read("src/components/admin/CustomerAccess.jsx");
const data = read("src/data/customerAccess.js");

test("every change sends the version the screen showed, and a reason", () => {
  assert.match(data, /disable: \(uid, \{ reason, note, expectedVersion \}\) => backendApi\.post\(`\$\{base\(uid\)\}\/disable`, \{ reason, note: note \|\| undefined, expectedVersion \}/);
  assert.match(data, /enable: \(uid, \{ reason, expectedVersion \}\) => backendApi\.post\(`\$\{base\(uid\)\}\/enable`, \{ reason, expectedVersion \}/);
  assert.match(component, /expectedVersion=\{account\.version\}/);
  assert.match(component, /disabled=\{trimmed\.length < MIN_REASON\}/);
  assert.match(component, /const MIN_REASON = 10;/, "matches the backend's 10-character minimum");
});

test("actions follow the server: disable only when allowed, re-enable only when allowed, administrators only", () => {
  assert.match(component, /account\.actions\?\.disable && \(/);
  assert.match(component, /account\.actions\?\.enable && \(/);
  assert.equal(component.match(/disabled=\{!isAdmin\}/g)?.length, 3, "disable, re-enable and the deletion check");
  assert.match(component, /\["owner", "admin"\]\.includes\(user\?\.staffRole\)/);
});

test("permanent deletion is a read-only check: no delete call, no delete button, no typed confirmation", () => {
  assert.ok(!/\/delete|method: "DELETE"|backendApi\.delete/.test(data), "no deletion endpoint in the data module");
  assert.match(data, /deletionPreview: \(uid\) => backendApi\.post\(`\$\{base\(uid\)\}\/deletion-preview`/);
  assert.ok(!/Permanently delete|typed|"DELETE"/.test(component), "no delete action in the screen");
  assert.match(component, /Danger zone: permanent deletion/);
  assert.match(component, /Nothing was changed\./);
});

test("a stale or out-of-state refusal is explained and the panel re-reads; focus returns to the section", () => {
  assert.match(component, /\["STALE_ACCOUNT_STATE", "INVALID_ACCOUNT_STATE"\]\.includes\(e\.code\)/);
  assert.match(component, /if \(stale\) onDone\(\);/);
  assert.match(component, /headingRef\.current\?\.focus\(\)/);
});

test("the list and audit log name the new states and actions", () => {
  const list = read("src/pages/admin/CustomersPage.jsx");
  assert.match(list, /row\.accountStatus && row\.accountStatus !== "ACTIVE"/);
  assert.match(list, /\{ value: "access", label: "Account access" \}/);
  const audit = read("src/pages/admin/AuditLogPage.jsx");
  for (const action of ["customer.temporarily_disabled", "customer.reenabled"]) assert.ok(audit.includes(`"${action}"`), action);
});

test("a dialog opened from the customer drawer owns the keyboard: only the top trap handles Escape and Tab", () => {
  const trap = read("packages/ui/src/lib/useFocusTrap.js");
  assert.match(trap, /const openTraps = \[\];/);
  assert.match(trap, /if \(openTraps\[openTraps\.length - 1\] !== trap\) return;/);
  assert.match(trap, /openTraps\.splice\(openTraps\.indexOf\(trap\), 1\);/);
});
