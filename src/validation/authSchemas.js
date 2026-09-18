import { z } from "zod";

// Mirrors backend/src/validation/authSchemas.js — kept in sync by hand since
// the two run in different runtimes. Client-side validation here is purely
// UX (instant feedback, no round trip); the backend re-validates everything
// regardless and is the actual source of truth.

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const verifyEmailCodeSchema = z.string().regex(/^\d{6}$/, "Enter all 6 digits.");

/** Runs a Zod schema and returns { data } or { fieldErrors: { [field]: message } }. */
export function validate(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data };

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { fieldErrors };
}
