import { localAdmin } from "./localStore.js";

/**
 * Admin screens.
 *
 * Customers, cards and payments all come from the browser-side store in
 * localStore.js — there is no admin API. Nothing here is a permission
 * boundary; the area is gated on being signed in and nothing more.
 */
export const adminService = {
  overview: () => localAdmin.overview(),
  customers: () => localAdmin.customers(),
  cards: () => localAdmin.cards(),
  payments: () => localAdmin.payments(),
};
