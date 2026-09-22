import { localCustomer } from "./localStore.js";

/**
 * Customer wallet and cards.
 *
 * Every figure is invented and lives in this browser only — see
 * localStore.js. The UI labels all of it DEMO.
 */
export const customerService = {
  overview: () => localCustomer.overview(),
  wallet: () => localCustomer.wallet(),
  /** Returns amount, rate, fees and total as separate fields. */
  quote: ({ amountUsd }) => localCustomer.quote({ amountUsd }),
  cards: () => localCustomer.cards(),
  createCard: () => localCustomer.createCard(),
  toggleFreeze: (cardId) => localCustomer.toggleFreeze(cardId),
  notifications: () => localCustomer.notifications(),
};
