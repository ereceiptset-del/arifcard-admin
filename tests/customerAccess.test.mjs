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
  assert.equal(component.match(/disabled=\{!isAdmin\}/g)?.length, 2, "disable and re-enable");
  assert.match(component, /\["owner", "admin"\]\.includes\(user\?\.staffRole\)/);
});

test("permanent deletion: preview and requests for administrators; execution offered only when the server says it can start, to the owner", () => {
  const panel = read("src/components/admin/DeletionPanel.jsx");
  assert.ok(!/method: "DELETE"|backendApi\.delete/.test(data), "no HTTP DELETE of a customer");
  assert.match(data, /deletionPreview: \(uid\) => backendApi\.post\(`\$\{base\(uid\)\}\/deletion-preview`/);
  assert.match(data, /executeDeletion: \(uid, body\) => backendApi\.post\(`\$\{base\(uid\)\}\/deletion\/execute`/);
  // The run button exists only behind the server's verdict and the owner.
  assert.match(panel, /const canExecute = preview\?\.canStartDeletion === true && isOwner;/);
  assert.match(panel, /\{canExecute && \(/);
  assert.match(panel, /Permanent deletion is not yet enabled\. This preview identifies records and policy requirements that must be resolved first\./);
  assert.match(panel, /Danger zone: permanent deletion/);
  assert.match(panel, /Nothing was changed\./);
  assert.match(panel, /typed === DELETE_CUSTOMER_PHRASE/);
  assert.match(data, /export const DELETE_CUSTOMER_PHRASE = "DELETE CUSTOMER";/);
  assert.ok(!/Permanently delete|"DELETE"/.test(component), "nothing irreversible in the access section itself");
});

test("deletion is hidden (owner decision): only a left-over request can be withdrawn", () => {
  const panel = read("src/components/admin/DeletionPanel.jsx");
  assert.match(data, /export const DELETION_FEATURE_ENABLED = false;/);
  assert.match(panel, /if \(!DELETION_FEATURE_ENABLED\) \{\s*if \(!actions\.cancelDeletion\) return null;/);
  assert.match(panel, /Withdraw deletion request/);
});

test("hard suspension: owner only, the brief's consequences, reason, password and the typed phrase", () => {
  const security = read("src/components/admin/SecurityActions.jsx");
  assert.equal(security.match(/disabled=\{!isOwner\}/g)?.length, 2, "suspend and lift");
  for (const line of ["disable Firebase Authentication access;", "revoke active sessions;", "block all Arifcard customer services;", "preserve financial, card, provider and audit history.", "reverse payments;", "close cards automatically;", "delete customer data."]) {
    assert.ok(security.includes(line), line);
  }
  assert.match(security, /typed === HARD_SUSPEND_PHRASE/);
  assert.match(security, /typed === LIFT_SUSPENSION_PHRASE/);
  assert.match(data, /export const HARD_SUSPEND_PHRASE = "SUSPEND CUSTOMER";/);
  assert.match(security, /type="password" autoComplete="current-password"/);
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
