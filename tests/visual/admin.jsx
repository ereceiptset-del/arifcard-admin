/**
 * Visual harness for the admin app (test tooling only).
 *
 * Renders the real admin app — real routes, layout, RequireStaff, services
 * and pages — with `fetch` answered from the synthetic records below.
 * There are no test accounts on the real backend, and the owner's
 * credentials are never used, so this is how the redesigned screens are
 * checked. Nothing here ships: Vite builds only /index.html.
 *
 *   /tests/visual/admin.html?path=/kyc/visual-case-1&theme=dark
 *   &role=customer   → signed in as a non-staff account (must see "Access denied")
 *   &role=reviewer   → staff with the reviewer role
 *
 * `window.__parity()` (on the Overview) checks that every figure the
 * previous Overview showed is on the page with the same value.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "../../src/styles/index.css";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { AuthProvider } from "../../src/context/AuthContext";
import App from "../../src/App.jsx";

const params = new URLSearchParams(window.location.search);
const now = Date.now();
const ago = (minutes) => new Date(now - minutes * 60_000).toISOString();
const role = params.get("role") || "admin";

const USER =
  role === "customer"
    ? { uid: "visual-customer", email: "test.customer@example.test", fullName: "Test Customer", emailVerified: true, isStaff: false, staffRole: null, isOwner: false }
    : { uid: "visual-staff", email: "test.staff@example.test", fullName: "Test Staff", emailVerified: true, isStaff: true, staffRole: role, isOwner: false };

const metric = (value) => ({ available: true, value });
const unavailable = (reason) => ({ available: false, reason });
const days = (values) => Object.fromEntries(values.map((v, i) => [new Date(now - (values.length - 1 - i) * 86_400_000).toISOString().slice(0, 10), v]));

// Values chosen to be distinctive, so the parity check can find each one.
export const ANALYTICS = {
  generatedAt: new Date(now).toISOString(),
  window: { period: "7d", startUtc: ago(60 * 24 * 7), endUtc: new Date(now).toISOString(), timezone: "Africa/Addis_Ababa", provider: "all" },
  customers: { total: metric(1204), active: metric(980), newInPeriod: metric(57), registrationsByDay: days([5, 9, 7, 11, 6, 12, 7]), truncated: false },
  kyc: {
    queue: { pending: 3, underReview: 1, approved: 41, rejected: 6, changesRequested: 2 },
    decidedInPeriod: metric(19),
    approvedInPeriod: metric(16),
    rejectedInPeriod: metric(2),
    approvalRate: metric(88.9),
    medianReviewMinutes: metric(150),
    decisionsByDay: days([{ approved: 2, rejected: 0, changesRequested: 1 }, { approved: 3, rejected: 1, changesRequested: 0 }, { approved: 1, rejected: 0, changesRequested: 0 }, { approved: 4, rejected: 1, changesRequested: 0 }, { approved: 2, rejected: 0, changesRequested: 0 }, { approved: 3, rejected: 0, changesRequested: 0 }, { approved: 1, rejected: 0, changesRequested: 0 }]),
    byDocument: { FAYDA: 40, PASSPORT: 10 },
    oldestWaiting: { id: "visual-case-1", submittedAt: ago(60 * 5), email: "t***@example.test" },
    truncated: false,
  },
  payments: {
    verifiedCount: metric(37),
    verifiedMinor: metric(18240000),
    verifiedBirr: "182400.00",
    byProvider: { CBE: { count: 30, minor: 15000000 }, TELEBIRR: { count: 7, minor: 3240000 } },
    needsReview: metric(2),
    verifying: metric(1),
    duplicateRejected: metric(4),
    providerFailures: metric(5),
    volumeByDay: days([{ count: 4, minor: 2000000 }, { count: 6, minor: 3100000 }, { count: 5, minor: 2400000 }, { count: 7, minor: 3300000 }, { count: 5, minor: 2600000 }, { count: 6, minor: 2900000 }, { count: 4, minor: 1940000 }]),
    principalMinor: unavailable("Needs a ledger, which isn't built yet."),
    feesMinor: unavailable("Needs a ledger, which isn't built yet."),
    refundsMinor: unavailable("Needs a ledger, which isn't built yet."),
    truncated: false,
  },
  operations: {
    failedNotifications: metric(2),
    pendingNotifications: metric(1),
    recentActivity: [
      { id: "a1", action: "kyc.decision", actorName: "Test Staff", createdAt: ago(30) },
      { id: "a2", action: "payment.staff_decision", actorName: "Test Staff", createdAt: ago(90) },
    ],
  },
  cards: { available: false, reason: "Card provider integration not available" },
};

/** Every figure the previous Overview rendered, as [label, value] — the parity contract. */
export const PARITY = [
  ["Waiting", "3"],
  ["Being reviewed", "1"],
  ["Changes requested", "2"],
  ["Approved", "41"],
  ["Rejected", "6"],
  ["New customers", "57"],
  ["Decisions made", "19"],
  ["Approval rate", "88.9%"],
  ["Median review time", "2.5 h"],
  ["Payments", "37"],
  ["Amount", "ETB 182,400.00"],
  ["CBE", "30"],
  ["Telebirr", "7"],
  ["Needs a person", "2"],
  ["Still checking", "1"],
  ["Already-allocated transactions", "4"],
  ["Provider unreachable", "5"],
  ["Received (verified)", "ETB 182,400.00"],
  ["Customer principal", "Unavailable"],
  ["Service fees", "Unavailable"],
  ["Refunds", "Unavailable"],
];

// A small synthetic "document" image (no real document is ever used here).
const SAMPLE_DOC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" rx="24" fill="#e8e2f8"/><rect x="40" y="60" width="140" height="180" rx="12" fill="#b9a7ec"/><rect x="220" y="80" width="340" height="22" rx="6" fill="#9a8ad0"/><rect x="220" y="130" width="280" height="18" rx="6" fill="#b9a7ec"/><rect x="220" y="170" width="300" height="18" rx="6" fill="#b9a7ec"/><text x="320" y="340" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#5a4a9a">Synthetic test document</text></svg>'
)}`;

const CASE = {
  id: "visual-case-1",
  kycStatus: "PENDING",
  method: "MANUAL_FAYDA",
  version: 2,
  currentSubmissionId: "sub-2",
  documentType: "FAYDA",
  requiredSlots: ["faydaFront", "faydaBack", "selfie"],
  details: {
    givenNames: "Test",
    surname: "Customer",
    documentNumber: "0000 0000 0000",
    dateOfBirth: "1990-01-01",
    addressLine: "Test street 1",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    phone: "+251 900 000 000",
    occupation: "Engineer",
    employmentStatus: "Employed",
    cardPurpose: "Online subscriptions",
    annualIncome: "ETB 100,000 – 500,000",
    monthlyIncome: "ETB 10,000 – 50,000",
    consentAcceptedAt: ago(60 * 5),
  },
  customerReason: null,
  submittedAt: ago(60 * 5),
  createdAt: ago(60 * 30),
  submission: {
    files: {
      faydaFront: { fileId: "f1", name: "id-front.jpg", size: 182000, contentType: "image/jpeg" },
      faydaBack: { fileId: "f2", name: "id-back.jpg", size: 176000, contentType: "image/jpeg" },
      selfie: { fileId: "f3", name: "selfie.jpg", size: 95000, contentType: "image/jpeg" },
    },
  },
  customer: { uid: "visual-customer", email: "test.customer@example.test", name: "Test Customer" },
  decision: null,
  internalNotes: [{ id: "n1", body: "Earlier submission had a blurred back side.", authorName: "Test Staff", createdAt: ago(60 * 24) }],
  submissionHistory: [
    { id: "sub-2", files: {}, submittedAt: ago(60 * 5), createdAt: ago(60 * 6) },
    { id: "sub-1", files: {}, submittedAt: ago(60 * 26), createdAt: ago(60 * 27) },
  ],
};

const CLAIM = {
  id: "visual-claim-1",
  status: "REQUIRES_REVIEW",
  reasonCode: "AMOUNT_MISMATCH",
  reasonCodes: ["AMOUNT_MISMATCH"],
  method: "CBE",
  tokenHint: "…BCDE",
  attempt: 2,
  diagnostic: "amount: 5000.00 ETB (receipt) vs 5500.00 ETB (expected)",
  submittedAt: ago(42),
  decidedAt: null,
  decidedBy: null,
  owner: { uid: "visual-customer", email: "test.customer@example.test", name: "Test Customer" },
  expected: { intentId: "i1", reference: "PAY-TEST01", amountMinor: 550000, currency: "ETB", receiverName: "Arifcard Test Account", receiverAccount: "•••• 0000", createdAt: ago(120), expiresAt: ago(-1320), status: "REQUIRES_REVIEW" },
  claimed: { payerName: "Test Customer", payerPhone: null, payerAccount: "•••• 2223", claimedAmountMinor: 550000, claimedPaidAt: ago(60), message: "Paid from the CBE app.", tokenHint: "…BCDE" },
  provider: { provider: "CBE", canonicalTransactionId: "FT26175ABCDE", paymentStatus: "SUCCESS", amountMinor: 500000, currency: "ETB", payerName: "TEST CUSTOMER", payerAccountOrPhone: "•••• 2223", receiverName: "ARIFCARD TEST ACCOUNT", receiverAccountOrMerchant: "•••• 0000", transactionTime: ago(59), providerReference: "FT26175ABCDE", narrative: "PAY-TEST01", rawSourceType: "html", parserVersion: "cbe-v3" },
  comparison: [
    { key: "amount", label: "Amount", expected: "5500.00 ETB", claimed: "5500.00 ETB", provider: "5000.00 ETB", result: "mismatch" },
    { key: "currency", label: "Currency", expected: "ETB", claimed: "ETB", provider: "ETB", result: "match" },
    { key: "receiverAccount", label: "Receiving account", expected: "•••• 0000", claimed: null, provider: "•••• 0000", result: "match" },
    { key: "transactionTime", label: "Time", expected: `${ago(120)} – ${ago(-1320)}`, claimed: ago(60), provider: ago(59), result: "match" },
    { key: "payerName", label: "Payer name", expected: null, claimed: "Test Customer", provider: "TEST CUSTOMER", result: "info" },
    { key: "orderReference", label: "Order reference", expected: "PAY-TEST01", claimed: null, provider: "PAY-TEST01", result: "match" },
  ],
  allocation: null,
  relatedClaims: [],
  actions: ["VERIFY", "REJECT", "REQUEST_CLARIFICATION"],
  needsTransactionId: false,
};

const ORDERS = [
  { id: "o1", status: "ISSUED", paymentReference: "PAY-TEST01", paymentIntentId: "i1", paymentAmountMinor: 550000, issueAttempt: 0, fundingId: "fund-1", operationId: "op-1", issueRequest: { limit: { amount: 2500, frequency: "monthly" } }, card: { last4: "0000", expiry: "09/29", status: "active", ready: true }, providerCardId: "card-1", problem: null, resolution: null },
  { id: "o2", status: "AWAITING_FUNDING", paymentReference: "PAY-TEST02", paymentIntentId: "i2", paymentAmountMinor: 120000, issueAttempt: 0, fundingId: null, operationId: null, issueRequest: null, card: null, providerCardId: null, problem: null, resolution: null },
];

const OPERATIONS = [
  { id: "op-2", action: "card.issue", status: "NEEDS_REVIEW", message: null, createdAt: ago(300), updatedAt: ago(200), uid: "visual-customer", environment: "sandbox", attempts: 2, reconcileAttempts: 3, providerRef: null, lastError: "Issuer timed out twice.", nextAttemptAt: null, leaseActive: false, history: [{ at: ago(300), from: null, to: "QUEUED", reason: "requested" }, { at: ago(290), from: "QUEUED", to: "SUBMITTING", reason: "claimed" }, { at: ago(280), from: "SUBMITTING", to: "UNKNOWN", reason: "timeout" }, { at: ago(200), from: "RECONCILING", to: "NEEDS_REVIEW", reason: "no answer after 3 checks" }] },
  { id: "op-1", action: "card.issue", status: "SUCCEEDED", message: null, createdAt: ago(2000), updatedAt: ago(1990), uid: "visual-customer", environment: "sandbox", attempts: 1, reconcileAttempts: 0, providerRef: "card-1", lastError: null, nextAttemptAt: null, leaseActive: false, history: [{ at: ago(2000), from: null, to: "QUEUED", reason: "requested" }, { at: ago(1990), from: "SUBMITTING", to: "SUCCEEDED", reason: "issuer confirmed" }] },
];

const EVENTS = [
  { id: "ev-2", provider: "codego", environment: "sandbox", eventId: "evt_0002", type: "kyc.status.updated", status: "UNMATCHED", detail: "No customer with this issuer user ID.", conflicting: false, attempts: 1, occurredAt: ago(80), receivedAt: ago(79), processedAt: ago(79), dataFields: ["status", "userId"], redactedKeys: [] },
  { id: "ev-1", provider: "codego", environment: "sandbox", eventId: "evt_0001", type: "card.created", status: "APPLIED", detail: null, conflicting: false, attempts: 1, occurredAt: ago(1990), receivedAt: ago(1989), processedAt: ago(1989), dataFields: ["cardId", "last4", "status"], redactedKeys: ["pan"] },
];

const SETTINGS = {
  configuration: {
    email: { label: "Email (SMTP)", status: "configured", detail: "Sends from a configured address." },
    storage: { label: "Document storage", status: "configured", detail: "Private bucket, signed links only." },
    cbeReceipts: { label: "CBE receipts", status: "configured", detail: "Receipts are read from CBE." },
    telebirrReceipts: { label: "Telebirr receipts", status: "configured", detail: "Receipts are read from Telebirr." },
    faydaApi: { label: "Fayda API", status: "not configured", detail: "On hold. Every verification here is a person's judgement." },
    cardProvider: { label: "Card provider (Codego)", status: "configured", detail: "sandbox · api.sandbox.example. Connection only." },
    owner: { label: "Owner account", status: "configured", detail: "Set." },
  },
};

const ROUTES = [
  [/^\/auth\/me$/, () => ({ user: USER })],
  [/^\/admin\/settings$/, () => SETTINGS],
  [/^\/admin\/analytics$/, () => ANALYTICS],
  [/^\/admin\/kyc\/cases$/, () => ({ cases: [CASE, { ...CASE, id: "visual-case-2", kycStatus: "APPROVED", version: 1, customer: { uid: "c2", email: "a***@example.test", name: "Another Customer" }, submittedAt: ago(60 * 50) }] })],
  [/^\/admin\/kyc\/cases\/[^/]+\/evidence\/[^/]+$/, () => ({ url: SAMPLE_DOC, expiresInSeconds: 300, contentType: "image/svg+xml", size: 1000 })],
  [/^\/admin\/kyc\/cases\/[^/]+\/(claim|notes)$/, () => ({ case: { ...CASE, kycStatus: "UNDER_REVIEW" } })],
  [/^\/admin\/kyc\/cases\/[^/]+\/decision$/, (body) => ({ case: { ...CASE, kycStatus: body.decision === "approve" ? "APPROVED" : body.decision === "reject" ? "REJECTED" : "CHANGES_REQUESTED", decision: { reasonCode: body.reasonCode, customerReason: body.customerReason || null, reviewerName: "Test Staff", decidedAt: new Date().toISOString() } }, notification: { status: "pending", attempts: 0 } })],
  [/^\/admin\/kyc\/cases\/[^/]+$/, () => ({ case: CASE })],
  [/^\/admin\/payments\/claims$/, () => ({ claims: [{ id: CLAIM.id, intent: { id: "i1", reference: "PAY-TEST01", amountMinor: 550000, currency: "ETB", status: "REQUIRES_REVIEW" }, claimedAmountMinor: 550000, providerAmountMinor: 500000, reasonCode: "AMOUNT_MISMATCH", tokenHint: "…BCDE", attempt: 2, submittedAt: ago(42), method: "CBE", status: "REQUIRES_REVIEW" }, { id: "c2", intent: { id: "i3", reference: "PAY-TEST03", amountMinor: 120000, currency: "ETB", status: "VERIFIED" }, claimedAmountMinor: 120000, providerAmountMinor: 120000, reasonCode: "VERIFIED_AUTOMATICALLY", tokenHint: "…9876", attempt: 1, submittedAt: ago(300), method: "TELEBIRR", status: "VERIFIED" }] })],
  [/^\/admin\/payments\/claims\/[^/]+\/(recheck|decision)$/, () => ({ claim: { ...CLAIM, status: "VERIFIED", actions: [] } })],
  [/^\/admin\/payments\/claims\/[^/]+$/, () => ({ claim: CLAIM })],
  [/^\/admin\/customers$/, () => ({ customers: [{ uid: "visual-customer", email: "t***@example.test", name: "Test Customer", active: true, disabled: false, emailVerified: true, kycStatus: "PENDING", kycMethod: "MANUAL_FAYDA", paymentCount: 2, createdAt: ago(60 * 24 * 3) }, { uid: "c2", email: "a***@example.test", name: "Another Customer", active: true, disabled: false, emailVerified: false, kycStatus: "NOT_SUBMITTED", kycMethod: null, paymentCount: 0, createdAt: ago(60 * 24) }], truncated: false })],
  [/^\/admin\/customers\/[^/]+$/, () => ({ customer: { uid: "visual-customer", email: "test.customer@example.test", name: "Test Customer", emailVerified: true, disabled: false, createdAt: ago(60 * 24 * 3), lastSignInAt: ago(30), cases: [{ id: CASE.id, kycStatus: "PENDING", method: "MANUAL_FAYDA", documentType: "FAYDA", version: 2, submittedAt: ago(60 * 5), decidedAt: null, reviewerName: null, customerReason: null }], payments: [{ id: "i1", method: "CBE", reference: "PAY-TEST01", amountMinor: 550000, currency: "ETB", status: "REQUIRES_REVIEW", createdAt: ago(120) }] } })],
  [/^\/admin\/provider\/customers\/[^/]+\/card-orders$/, () => ({ orders: ORDERS })],
  [/^\/admin\/provider\/customers\/[^/]+\/funding$/, () => ({ route: { ready: true, reason: null }, problem: null, balances: { values: [], note: "Sandbox balances." }, options: [], records: [] })],
  [/^\/admin\/provider\/customers\/[^/]+\/refresh$/, () => ({ refreshed: true, onboarding: { state: "APPROVED" } })],
  [/^\/admin\/provider\/customers\/[^/]+$/, () => ({ onboarding: { state: "APPROVED", applicationStatus: "approved", session: { status: "closed", resumable: false }, externalUserId: "ext-1", providerUserId: "usr-1", lastEventAt: ago(1000), lastRefreshedAt: ago(500), correlationProblem: null, gateBlocks: [] } })],
  [/^\/admin\/notification-jobs$/, () => ({ jobs: [{ id: "j3", type: "kyc_decision", subjectId: CASE.id, status: "failed", attempts: 3, lastError: "SMTP 421 try again later", ambiguous: true, sentAt: null, createdAt: ago(200) }, { id: "j2", type: "payment_verified", subjectId: "i3", status: "sent", attempts: 1, lastError: null, ambiguous: false, sentAt: ago(290), createdAt: ago(300) }, { id: "j1", type: "card_order_update", subjectId: "o1", status: "pending", attempts: 0, lastError: null, ambiguous: false, sentAt: null, createdAt: ago(5) }] })],
  [/^\/admin\/notification-jobs\/[^/]+\/retry$/, () => ({ job: { id: "j3", status: "pending" } })],
  [/^\/admin\/audit$/, () => ({ entries: [{ id: "e2", action: "kyc.decision", actorUid: "visual-staff", actorName: "Test Staff", subjectType: "kyc_case", subjectId: "visual-case-2", detail: { decision: "approve", reasonCode: "APPROVED", version: 1 }, createdAt: ago(30) }, { id: "e1", action: "card.order.issuance", actorUid: "system", actorName: "Provider worker", subjectType: "card_order", subjectId: "o1", detail: { fromStatus: "ISSUING", toStatus: "ISSUED", operationId: "op-1" }, createdAt: ago(1990) }] })],
  [/^\/admin\/provider\/operations$/, () => ({ operations: OPERATIONS })],
  [/^\/admin\/provider\/operations\/[^/]+\/(reconcile|resolve)$/, () => ({ operation: { ...OPERATIONS[0], status: "RECONCILING" } })],
  [/^\/admin\/provider\/events$/, () => ({ events: EVENTS })],
  [/^\/admin\/provider\/events\/[^/]+\/reprocess$/, () => ({ event: { ...EVENTS[0], status: "RECEIVED" } })],
  [/^\/admin\/provider\/connection-check$/, () => ({ check: { ok: true, environment: "sandbox", httpStatus: 200, cardCount: 1 }, checkedAt: new Date().toISOString() })],
];

const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

try {
  if (["light", "dark"].includes(params.get("theme"))) localStorage.setItem("addiscard-theme", params.get("theme"));
  localStorage.setItem("addiscard_token", "visual-harness-token");
  window.addEventListener("pagehide", () => localStorage.removeItem("addiscard_token"));
} catch {
  /* storage blocked */
}

window.fetch = (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  const path = url.pathname.replace(/^.*\/api/, "");
  const body = init.body ? JSON.parse(init.body) : {};
  for (const [pattern, respond] of ROUTES) if (pattern.test(path)) return json(respond(body));
  return json({ message: "Not part of this harness.", code: "NOT_FOUND" }, 404);
};

/** Analytics parity: each old figure must appear on the Overview with the same value. */
window.__parity = () => {
  const rows = [...document.querySelectorAll("main dl > div")].map((row) => ({
    label: row.querySelector("dt")?.textContent || "",
    value: row.querySelector("dd")?.textContent?.trim() || "",
  }));
  const results = PARITY.map(([label, value]) => {
    const found = rows.filter((row) => row.label.startsWith(label));
    const ok = found.some((row) => row.value === value || row.value.startsWith(`${value} (`));
    return { label, expected: value, found: found.map((row) => row.value), ok };
  });
  return { passed: results.filter((r) => r.ok).length, total: results.length, failures: results.filter((r) => !r.ok) };
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <MemoryRouter initialEntries={[params.get("path") || "/"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  </StrictMode>
);
