/**
 * Shared contracts between the two apps and the mock API.
 *
 * These mirror the values in backend/mock/db.js. Keeping them in
 * one place stops the customer and admin apps drifting apart on status
 * names and label copy.
 */

export const CASE_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  CHANGES_REQUESTED: "changes_requested",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const CASE_STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Not approved",
  none: "Not started",
};

/** Badge tone per case status, so both apps colour them identically. */
export const CASE_STATUS_TONE = {
  draft: "neutral",
  submitted: "info",
  under_review: "info",
  changes_requested: "warn",
  approved: "ok",
  rejected: "danger",
  none: "neutral",
};

/**
 * The card issuer's decision, tracked separately from Addiscard's own
 * review. An approved case does not mean an issuer approved anything.
 */
export const ISSUER_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  DECLINED: "declined",
};

export const ISSUER_STATUS_LABEL = {
  not_submitted: "Not sent to issuer",
  pending: "With issuer",
  approved: "Issuer approved",
  declined: "Issuer declined",
};

export const CARD_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  FROZEN: "frozen",
};

export const CARD_STATUS_LABEL = {
  pending: "Pending",
  active: "Active",
  frozen: "Frozen",
};

export const CARD_STATUS_TONE = {
  pending: "warn",
  active: "ok",
  frozen: "info",
};

/** Only Fayda and Passport are accepted. Driver's licence is not offered. */
export const VERIFICATION_METHODS = [
  {
    value: "fayda",
    label: "Fayda digital ID",
    description: "Simulated lookup using your Fayda number. No documents to upload.",
  },
  {
    value: "passport",
    label: "Passport",
    description: "Upload the photo page of your passport.",
  },
];

export const EMPLOYMENT_OPTIONS = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Not currently working" },
  { value: "retired", label: "Retired" },
];

export const CARD_PURPOSE_OPTIONS = [
  { value: "online_shopping", label: "Online shopping" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "advertising", label: "Advertising and business tools" },
  { value: "travel", label: "Travel and flights" },
  { value: "other", label: "Something else" },
];

/** Income bands carry an explicit currency so the figure is never ambiguous. */
export const ANNUAL_INCOME_OPTIONS = [
  { value: "under_1000", label: "Under $1,000 per year" },
  { value: "1000_5000", label: "$1,000 – $5,000 per year" },
  { value: "5000_20000", label: "$5,000 – $20,000 per year" },
  { value: "over_20000", label: "Over $20,000 per year" },
];

export const MONTHLY_INCOME_OPTIONS = [
  { value: "under_100", label: "Under $100 per month" },
  { value: "100_500", label: "$100 – $500 per month" },
  { value: "500_2000", label: "$500 – $2,000 per month" },
  { value: "over_2000", label: "Over $2,000 per month" },
];

export const MAX_UPLOAD_BYTES = 500 * 1024;

export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label || value || "—";
}

/**
 * Occupation options for the verification wizard's searchable picker.
 * Generic job titles, kept short enough to scan and long enough that the
 * search box earns its place.
 */
export const OCCUPATIONS = [
  "Accountant",
  "Administrative assistant",
  "Architect",
  "Bank teller",
  "Business analyst",
  "Civil engineer",
  "Construction manager",
  "Consultant",
  "Content writer",
  "Customer support agent",
  "Data analyst",
  "Delivery driver",
  "Dentist",
  "Digital marketer",
  "Electrician",
  "Electrical engineer",
  "Farmer",
  "Financial analyst",
  "Graphic designer",
  "Hotel manager",
  "Human resources officer",
  "Import and export trader",
  "Insurance agent",
  "Journalist",
  "Laboratory technician",
  "Lawyer",
  "Logistics coordinator",
  "Mechanic",
  "Mechanical engineer",
  "Network administrator",
  "Nurse",
  "Office manager",
  "Pharmacist",
  "Photographer",
  "Physician",
  "Product manager",
  "Project manager",
  "Quality assurance engineer",
  "Real estate agent",
  "Researcher",
  "Restaurant owner",
  "Retail shop owner",
  "Sales representative",
  "Security officer",
  "Social worker",
  "Software developer",
  "Student",
  "Tailor",
  "Teacher",
  "Tour guide",
  "Translator",
  "Transport operator",
  "UX designer",
  "Veterinarian",
  "Video editor",
  "Warehouse supervisor",
  "Other",
];
