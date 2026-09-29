/**
 * Checks the built admin app (dist/) is what this site should serve:
 * the console, and nothing from the customer or marketing site.
 *
 *   npm run build && node scripts/check-bundle.mjs
 *
 * Run by `npm test` and before every `npm run deploy`. Prints findings,
 * never file contents; exits non-zero on any failure.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

/** Strings that only the customer/marketing/sign-up code contains. */
export const FORBIDDEN = [
  "Create an account", // sign-up
  "PaymentDialog", // customer payments
  "Card issuer verification", // customer onboarding panel
  "Order a card", // customer card orders
  "addiscard_customer", // (guard: no customer storage keys)
  "/customer/verification",
  "localhost:4000", // a production build must use same-origin /api
];

/** Strings the console must contain. */
export const REQUIRED = ["Identity verification", "Audit logs", "Access denied"];

export function checkBundle(dir = dist) {
  const problems = [];
  if (!existsSync(join(dir, "index.html"))) return ["dist/index.html missing — run npm run build"];
  const html = readFileSync(join(dir, "index.html"), "utf8");
  if (/<script>(?!\s*<\/script>)/.test(html)) problems.push("index.html has an inline <script> (the CSP forbids it)");
  if (!html.includes('name="robots" content="noindex')) problems.push("index.html lacks noindex");

  const assets = existsSync(join(dir, "assets")) ? readdirSync(join(dir, "assets")).filter((f) => f.endsWith(".js")) : [];
  const js = assets.map((f) => readFileSync(join(dir, "assets", f), "utf8")).join("\n");
  for (const s of FORBIDDEN) if (js.includes(s)) problems.push(`bundle contains "${s}"`);
  for (const s of REQUIRED) if (!js.includes(s)) problems.push(`bundle lacks "${s}"`);
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = checkBundle();
  if (problems.length) {
    console.error("Admin bundle check FAILED:\n  - " + problems.join("\n  - "));
    process.exit(1);
  }
  console.log("Admin bundle check passed.");
}
