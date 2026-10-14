import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email kiritish majburiy" })
    .email({ message: "Noto'g'ri email formati" })
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, { message: "Parol kiritish majburiy" }),
  captchaAnswer: z.string().optional(),
  captchaToken: z.string().optional(),
});
