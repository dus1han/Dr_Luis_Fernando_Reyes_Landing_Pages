import { z } from "zod";

/**
 * Shared by the client form and the API route, so validation rules can
 * never drift between what the user sees and what the server accepts.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "That name looks too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(24, "Please enter a valid phone number")
    .regex(/^[+\d][\d\s()-]{6,}$/, "Please enter a valid phone number"),

  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .max(120, "That email looks too long")
    .pipe(z.email("Please enter a valid email address")),

  /**
   * Deliberately only name, phone and email. Every additional field costs
   * completions, and the clinic calls back to gather the rest anyway —
   * so asking for preferred time, procedure interest or a message here
   * bought nothing that a two-minute phone call doesn't.
   */

  consent: z.literal(true, {
    message: "Please confirm we may contact you",
  }),

  /** Bot trap — must stay empty. Hidden from real users. */
  company: z.string().max(0).optional(),

  /** Milliseconds the user spent on the form; sub-second means a bot. */
  elapsedMs: z.number().int().nonnegative().optional(),

  /** Google Ads attribution, captured from the URL on mount. */
  gclid: z.string().max(200).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  page: z.string().max(120).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Field-keyed error map, ready to render inline under each input. */
export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

export function toFieldErrors(error: z.ZodError<LeadInput>): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof LeadInput | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
