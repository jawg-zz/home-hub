import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (pwd) => /[A-Z]/.test(pwd),
    "Password must contain at least one uppercase letter",
  )
  .refine(
    (pwd) => /[a-z]/.test(pwd),
    "Password must contain at least one lowercase letter",
  )
  .refine(
    (pwd) => /[0-9]/.test(pwd),
    "Password must contain at least one number",
  )
  .refine(
    (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    "Password must contain at least one special character (!@#$%^&*)",
  );

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(1).max(100).optional(),
});

export const shoppingItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
});

export const shoppingItemUpdateSchema = z.object({
  checked: z.boolean(),
});

export const choreSchema = z.object({
  title: z.string().min(1).max(200),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const choreUpdateSchema = z.object({
  completed: z.boolean(),
});

export const deviceStatusSchema = z.object({
  status: z.enum(["on", "off", "locked"]),
});

export const deviceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  room: z.string().min(1).max(100),
  status: z.enum(["on", "off", "locked"]).default("off"),
  value: z.number().int().min(0).max(100).default(0),
  online: z.boolean().default(false),
});
