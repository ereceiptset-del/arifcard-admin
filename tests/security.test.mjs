import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Security regression for the redesign (Checkpoint D): the redesign must
 * not have loosened anything. Static checks only; the backend's own access
 * tests cover the API.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
function files(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    return statSync(join(root, rel)).isDirectory() ? files(rel) : /\.(jsx?|mjs)$/.test(name) ? [rel] : [];
  });
}
const SOURCE = [...files("src"), ...files("packages")];

const headers = () => {
  const config = JSON.parse(read("firebase.json"));
  const all = (config.hosting.headers || []).flatMap((block) => block.headers);
  return Object.fromEntries(all.map((h) => [h.key.toLowerCase(), h.value]));
};

test("hosting security headers are still in place", () => {
  const h = headers();
  const csp = h["content-security-policy"] || h["content-security-policy-report-only"];
  assert.ok(csp, "a content security policy is set");
  for (const directive of ["default-src 'self'", "script-src 'self'", "object-src 'none'"]) assert.ok(csp.includes(directive), `CSP keeps ${directive}`);
  assert.ok(!/style-src[^;]*'unsafe-inline'/.test(csp), "no inline styles allowed");
  assert.ok(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), "no inline or eval scripts allowed");
  assert.equal(h["x-frame-options"], "DENY");
  assert.equal(h["x-content-type-options"], "nosniff");
});

test("the font stylesheet requested before first paint is allowed by the CSP", () => {
  const h = headers();
  const csp = h["content-security-policy"] || h["content-security-policy-report-only"];
  const init = read("public/theme-init.js");
  const host = init.match(/https:\/\/([a-z.]+)\/css2/)[1];
  assert.match(csp, new RegExp(`style-src[^;]*https://${host.replace(/\./g, "\\.")}`));
});

test("no unsafe DOM or code evaluation in the app", () => {
  for (const file of SOURCE) {
    const text = code(read(file));
    assert.ok(!/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function\(/.test(text), `${file} uses an unsafe DOM or eval pattern`);
  }
});

test("browser storage holds only the session token, theme and sidebar preference", () => {
  const keys = new Set();
  for (const file of SOURCE) {
    for (const m of code(read(file)).matchAll(/localStorage\.setItem\(\s*([A-Z_]+|"[^"]+")/g)) keys.add(m[1]);
  }
  assert.deepEqual([...keys].sort(), ["COLLAPSE_KEY", "STORAGE_KEY", "TOKEN_STORAGE_KEY"]);
});

test("the card component can only show the last four digits", () => {
  const text = code(read("packages/ui/src/components/VirtualCard.jsx"));
  assert.ok(!/\b(pan|cardNumber|fullNumber|cvc|cvv|pin)\b/i.test(text), "no full number, CVC or PIN prop exists");
});

test("every admin screen sits inside the staff gate", () => {
  const routes = read("src/routes/AppRoutes.jsx");
  const gateStart = routes.indexOf("<RequireStaff>");
  const gateEnd = routes.indexOf('<Route path="/admin/*"');
  assert.ok(gateStart > 0 && gateEnd > gateStart);
  for (const page of [...routes.matchAll(/const (\w+Page) = lazy\(\(\) => import\("\.\.\/pages\/admin\//g)].map((m) => m[1])) {
    const at = routes.indexOf(`<${page} />`);
    assert.ok(at > gateStart && at < gateEnd, `${page} is routed outside RequireStaff`);
  }
  assert.match(read("src/components/auth/RequireStaff.jsx"), /if \(!user\.isStaff\)/);
});

test("card issuer actions go only to existing staff-protected admin endpoints", () => {
  const text = read("src/data/providerOps.js");
  for (const m of text.matchAll(/`(\/[^`$]+)/g)) assert.ok(m[1].startsWith("/admin/provider/"), `${m[1]} is outside /admin/provider`);
});

test("test tooling is never part of the production build", () => {
  const vite = read("vite.config.js");
  assert.ok(!/rollupOptions|input\s*:/.test(vite), "the build input stays the default index.html");
});
