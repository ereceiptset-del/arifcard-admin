import { unavailable } from "./unavailable.js";

/**
 * Customer wallet, cards and transactions.
 *
 * None of this is built. There is no wallet, no card issuer and no payment
 * rail behind the backend yet, so every call here refuses instead of
 * returning a number that would look like the customer's money.
 */
export const customerService = {
  overview: unavailable("Your dashboard"),
  wallet: unavailable("Your wallet"),
  quote: unavailable("Top-up pricing"),
  cards: unavailable("Cards"),
  createCard: unavailable("Creating a card"),
  toggleFreeze: unavailable("Freezing a card"),
  notifications: unavailable("Notifications"),
};
