import { unavailable } from "./unavailable.js";

/**
 * Admin screens.
 *
 * Nothing here is built. These refuse rather than showing invented
 * customers, cards or payments, which would misrepresent the state of the
 * business to staff.
 */
export const adminService = {
  overview: unavailable("The admin overview"),
  customers: unavailable("The customer list"),
  cards: unavailable("Card records"),
  payments: unavailable("Payment records"),
};
