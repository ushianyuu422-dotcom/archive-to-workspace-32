import { z } from "zod";

export { z };

/** Philippine mobile or landline, e.g. 09123456789, +639123456789, 02-81234567 */
export const PHONE_RE = /^(09\d{9}|\+639\d{9}|0\d{2,3}-?\d{7})$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_RE, "Enter a valid Philippine contact number (e.g. 09123456789).");

export const required = (label: string, max = 80) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);

export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? "");

/** Date string YYYY-MM-DD, must be a real date */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a valid date.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Use the date picker to choose a valid date.");

export const optionalDate = dateString.optional().nullable().transform((v) => v ?? null);

export const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  first_name: required("First name", 60),
  middle_name: optionalText(60),
  last_name: required("Last name", 60),
  birthdate: optionalDate,
  sex: z.enum(["male", "female", ""]).optional().transform((v) => v ?? ""),
  street: required("Street", 120),
  purok: required("Purok / Zone", 60),
  barangay: z.string().trim().min(1).max(60).default("Wawa"),
  contact_number: phoneSchema,
  is_senior: z.boolean().default(false),
  is_pwd: z.boolean().default(false),
  senior_id_number: optionalText(40),
  pwd_id_number: optionalText(40),
  pwd_disability_type: optionalText(60),
});

export type SignUpInput = z.input<typeof signupSchema>;

export const profileUpdateSchema = signupSchema.omit({ email: true, password: true });

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;

export const requestSchema = z.object({
  service_id: z.string().uuid("Choose a service."),
  first_name: required("First name", 60),
  middle_name: optionalText(60),
  last_name: required("Last name", 60),
  street: required("Street", 120),
  purok: required("Purok / Zone", 60),
  barangay: required("Barangay", 60),
  contact_number: phoneSchema,
  details: optionalText(1000),
});

export type RequestInput = z.input<typeof requestSchema>;

export const reservationSchema = z.object({
  res_date: dateString,
  slot: required("Time slot", 20),
  purpose: required("Purpose of reservation", 200),
  contact_number: phoneSchema,
});

export const problemSchema = z.object({
  category: required("Category", 60),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters.")
    .max(2000, "Description must be 2000 characters or fewer."),
  street: required("Street", 120),
  purok: required("Purok / Zone", 60),
  barangay: required("Barangay", 60),
});

export const settingsSchema = z.object({
  hall_address: required("Barangay hall address", 200),
  office_hours: required("Office hours", 120),
  office_email: z.string().trim().email("Enter a valid email address.").max(200),
  office_phone: optionalText(40),
  facebook_url: optionalText(200),
  court_fee: z.coerce.number().min(0, "Fee cannot be negative.").max(100000),
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{2,8}$/, "Code must be 2–8 capital letters or digits."),
  name: required("Service name", 120),
  description: optionalText(500),
  requirements: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  fee: z.coerce.number().min(0).max(100000),
  enabled: z.boolean().default(true),
  sort: z.coerce.number().int().min(0).max(999).default(0),
});

export const newsSchema = z.object({
  id: z.string().uuid().optional(),
  title: required("Title", 160),
  category: required("Category", 40),
  body: required("Body", 8000),
  image_path: z.string().trim().max(400).optional().nullable(),
  published: z.boolean().default(false),
});

export const rejectReason = (label: string) =>
  z
    .string()
    .trim()
    .min(5, `Give a ${label.toLowerCase()} reason (at least 5 characters).`)
    .max(500);
