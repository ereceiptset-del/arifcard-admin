import { ApiError } from "./apiClient.js";
import { CARD_STATUS } from "./contracts.js";

/**
 * Browser-side data for the signed-in dashboards.
 *
 * There is no API behind these screens. This module stands in for one so
 * they can be used and looked at: same shapes, same call signatures, and a
 * small delay so loading states still appear.
 *
 * It is not a backend and does not pretend to be one:
 *
 * - Every figure is invented. Balances, exchange rates, fees and card
 *   numbers are made up, and the UI labels them DEMO.
 * - Data lives in this browser only, so it is per-device and resets when
 *   site data is cleared.
 *
 * Signing in is the one real thing — that goes to the backend on :4000.
 */

const STORAGE_KEY = "addiscard_ui_demo_v2";

/** Artificial delay so loading and skeleton states still appear. */
const LATENCY_MS = 200;

const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const id = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

/** Demo FX and fee schedule. Not real pricing. */
export const DEMO_QUOTE_CONFIG = {
  rateEtbPerUsd: 138.5,
  serviceFeePercent: 2.5,
  fixedFeeEtb: 15,
};

/** Invented people, so the admin screens are not empty on a first visit. */
function seed() {
  return {
    customers: {
      usr_demo_1: {
        id: "usr_demo_1",
        fullName: "Hanna Tesfaye",
        email: "hanna@example.test",
        createdAt: daysAgo(30),
      },
      usr_demo_2: {
        id: "usr_demo_2",
        fullName: "Yonas Girma",
        email: "yonas@example.test",
        createdAt: daysAgo(2),
      },
    },
    wallets: {
      usr_demo_1: {
        currency: "USD",
        balance: 42.5,
        transactions: [
          { id: "txn_1", type: "deposit", label: "Demo top-up", amountUsd: 50, createdAt: daysAgo(6), status: "completed" },
          { id: "txn_2", type: "card_funding", label: "Funded card ••4921", amountUsd: -7.5, createdAt: daysAgo(4), status: "completed" },
        ],
      },
      usr_demo_2: { currency: "USD", balance: 0, transactions: [] },
    },
    cards: {
      usr_demo_1: [
        {
          id: "card_1",
          status: CARD_STATUS.ACTIVE,
          brand: "visa",
          last4: "4921",
          expiry: "11/29",
          balanceUsd: 7.5,
          createdAt: daysAgo(4),
        },
      ],
      usr_demo_2: [],
    },
    notifications: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Private browsing, blocked storage, or corrupt JSON — start fresh.
  }
  return seed();
}

let state = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable. Everything still works for this page view.
  }
}

/** Clears the demo data. Exposed so a reset does not need devtools. */
export function resetLocalStore() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  state = seed();
}

async function respond(value) {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  // Deep clone so a screen holding a result cannot mutate the store.
  return JSON.parse(JSON.stringify(value));
}

function fail(message, code) {
  return new ApiError(message, { code });
}

/* ---------- the signed-in account ---------- */

let currentUser = null;

/**
 * Records who is signed in, and gives them a row of their own so they show
 * up on the admin screens alongside the invented people.
 */
export function setCurrentUser(user) {
  currentUser = user || null;
  if (!user?.uid) return;

  if (!state.customers[user.uid]) {
    state.customers[user.uid] = {
      id: user.uid,
      fullName: user.fullName || user.email,
      email: user.email,
      createdAt: now(),
    };
    save();
  }
}

function requireUser() {
  if (!currentUser?.uid) throw fail("Not signed in.", "UNAUTHENTICATED");
  return currentUser;
}

function walletFor(key) {
  if (!state.wallets[key]) state.wallets[key] = { currency: "USD", balance: 0, transactions: [] };
  return state.wallets[key];
}

function cardsFor(key) {
  if (!state.cards[key]) state.cards[key] = [];
  return state.cards[key];
}

function notificationsFor(key) {
  if (!state.notifications[key]) state.notifications[key] = [];
  return state.notifications[key];
}

/* ---------- customer ---------- */

export const localCustomer = {
  async overview() {
    const user = requireUser();
    const wallet = walletFor(user.uid);
    return respond({
      wallet: { currency: wallet.currency, balance: wallet.balance },
      cards: cardsFor(user.uid),
    });
  },

  async wallet() {
    const user = requireUser();
    return respond({ wallet: walletFor(user.uid) });
  },

  async quote({ amountUsd }) {
    const amount = Number(amountUsd);
    if (!amount || amount <= 0) throw fail("Enter an amount greater than zero.", "VALIDATION_ERROR");
    const { rateEtbPerUsd, serviceFeePercent, fixedFeeEtb } = DEMO_QUOTE_CONFIG;
    const subtotalEtb = amount * rateEtbPerUsd;
    const serviceFeeEtb = (subtotalEtb * serviceFeePercent) / 100;
    return respond({
      fundingAmountUsd: amount,
      rateEtbPerUsd,
      subtotalEtb,
      serviceFeePercent,
      serviceFeeEtb,
      fixedFeeEtb,
      totalEtb: subtotalEtb + serviceFeeEtb + fixedFeeEtb,
    });
  },

  async cards() {
    const user = requireUser();
    return respond({ cards: cardsFor(user.uid) });
  },

  async createCard() {
    const user = requireUser();
    const card = {
      id: id("card"),
      status: CARD_STATUS.ACTIVE,
      brand: "visa",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiry: "11/29",
      balanceUsd: 0,
      createdAt: now(),
    };
    cardsFor(user.uid).push(card);
    save();
    return respond({ card });
  },

  async toggleFreeze(cardId) {
    const user = requireUser();
    const card = cardsFor(user.uid).find((item) => item.id === cardId);
    if (!card) throw fail("Card not found.", "NOT_FOUND");
    card.status = card.status === CARD_STATUS.FROZEN ? CARD_STATUS.ACTIVE : CARD_STATUS.FROZEN;
    save();
    return respond({ card });
  },

  async notifications() {
    const user = requireUser();
    return respond({ notifications: notificationsFor(user.uid) });
  },
};

/* ---------- admin ---------- */

function everyCustomer() {
  return Object.values(state.customers);
}

export const localAdmin = {
  async overview() {
    const customers = everyCustomer();
    const cards = customers.flatMap((customer) => cardsFor(customer.id));
    const transactions = customers.flatMap((customer) => walletFor(customer.id).transactions);
    const balance = customers.reduce((total, customer) => total + walletFor(customer.id).balance, 0);

    return respond({
      counts: {
        customers: customers.length,
        cards: cards.length,
        activeCards: cards.filter((card) => card.status === CARD_STATUS.ACTIVE).length,
        payments: transactions.length,
      },
      totalBalanceUsd: balance,
      recentPayments: [...transactions]
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
        .slice(0, 8),
    });
  },

  async customers() {
    return respond({
      customers: everyCustomer()
        .map((customer) => ({
          ...customer,
          cardCount: cardsFor(customer.id).length,
          balanceUsd: walletFor(customer.id).balance,
        }))
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    });
  },

  async cards() {
    const cards = [];
    for (const customer of everyCustomer()) {
      for (const card of cardsFor(customer.id)) {
        cards.push({ ...card, ownerName: customer.fullName, ownerEmail: customer.email });
      }
    }
    cards.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return respond({ cards });
  },

  async payments() {
    const payments = [];
    for (const customer of everyCustomer()) {
      for (const tx of walletFor(customer.id).transactions) {
        payments.push({ ...tx, ownerName: customer.fullName, ownerEmail: customer.email });
      }
    }
    payments.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return respond({ payments });
  },
};
