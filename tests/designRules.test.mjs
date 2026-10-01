import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Design-system rules for redesigned files (docs/design-system.md §2).
 * The list grows as screens are redesigned; screens not yet redesigned are
 * not checked.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI = join(root, "packages/ui/src");

const REDESIGNED = [
  "src/layouts/AdminLayout.jsx",
  "src/pages/admin/OverviewPage.jsx",
  "src/pages/admin/KycQueuePage.jsx",
  "src/pages/admin/KycCasePage.jsx",
  "src/pages/admin/PaymentsPage.jsx",
  "src/pages/admin/CustomersPage.jsx",
  "src/pages/admin/CardOperationsPage.jsx",
  "src/pages/admin/TransactionsPage.jsx",
  "src/pages/admin/NotificationsPage.jsx",
  "src/pages/admin/AuditLogPage.jsx",
  "src/pages/admin/SettingsPage.jsx",
  "src/components/admin/IssuerCardOrders.jsx",
  "src/components/admin/IssuerFunding.jsx",
  "src/data/providerOps.js",
  ...readdirSync(join(UI, "components")).map((file) => `packages/ui/src/components/${file}`),
  "packages/ui/src/layout/AppShell.jsx",
];

// Card artwork and the chip are the one place fixed colours belong.
const ARTWORK = new Set(["packages/ui/src/components/VirtualCard.jsx"]);

const read = (file) => readFileSync(join(root, file), "utf8");
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("no hard-coded colours outside the card artwork", () => {
  for (const file of REDESIGNED.filter((file) => !ARTWORK.has(file))) {
    const hits = code(read(file)).match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    assert.deepEqual(hits, [], `${file} has hex colours: ${hits.join(", ")}`);
  }
});

test("no dark: twins — tokens follow the theme on their own", () => {
  for (const file of REDESIGNED) {
    assert.ok(!/\bdark:/.test(code(read(file))), `${file} uses a dark: utility`);
  }
});

test("no arbitrary radius or shadow in redesigned files", () => {
  for (const file of REDESIGNED) {
    const hits = code(read(file)).match(/\b(?:rounded|shadow)-\[[^\]]+\]/g) || [];
    assert.deepEqual(hits, [], `${file}: ${hits.join(", ")}`);
  }
});

test("no tracked-out all-caps labels or monospace labels", () => {
  for (const file of REDESIGNED) {
    const text = code(read(file));
    assert.ok(!/\buppercase\b/.test(text) || file.endsWith("AppShell.jsx"), `${file} uses uppercase`);
    assert.ok(!/\btracking-(?:wide|wider|widest)\b|tracking-\[0\.1/.test(text), `${file} uses wide tracking`);
    assert.ok(!/\bfont-mono\b/.test(text), `${file} uses font-mono`);
  }
});

test("no text smaller than the 12px caption", () => {
  for (const file of REDESIGNED) {
    const hits = code(read(file)).match(/text-\[(?:[0-9]|1[01])(?:\.\d+)?px\]/g) || [];
    assert.deepEqual(hits, [], `${file}: ${hits.join(", ")}`);
  }
});

test("no button nested inside a link on redesigned admin screens", () => {
  for (const file of REDESIGNED.filter((f) => f.startsWith("src/pages"))) {
    assert.ok(!/<Link[^>]*>\s*<Button/.test(read(file)), `${file}: use buttonClasses() on the Link instead`);
  }
});

test("payments review has no direct status control (only the protected decision)", () => {
  const text = read("src/pages/admin/PaymentsPage.jsx");
  assert.ok(!/status:\s*["']VERIFIED["']/.test(text), "the client must never set a payment status");
});
