import { z } from "zod";
import xss from "xss";

// Parol kamida 8 ta belgi, 1 ta katta harf, 1 ta kichik harf, 1 ta raqam va 1 ta maxsus belgi bo'lishi kerak.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email kiritish majburiy" })
    .email({ message: "Noto'g'ri email formati" })
    .transform((val) => xss(val.trim())), // Sanitize and trim
  password: z
    .string()
    .min(1, { message: "Parol kiritish majburiy" })
    .regex(passwordRegex, {
      message: "Parol kamida 8 ta belgi, katta-kichik harflar, raqam va maxsus belgilarni o'z ichiga olishi kerak",
    })
    .transform((val) => xss(val.trim())), // Sanitize and trim
  captchaToken: z.string().optional(),
});
