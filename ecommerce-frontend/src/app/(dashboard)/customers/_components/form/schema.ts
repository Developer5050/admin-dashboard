import * as z from "zod";

export const customerFormSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, "Last name must be 50 characters or less"),
  email: z
    .string()
    .min(1, { message: "Customer email is required" })
    .email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(/^\+?[0-9]\d{1,14}$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
