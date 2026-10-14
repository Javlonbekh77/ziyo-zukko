import crypto from "crypto";

const CAPTCHA_SECRET = process.env.SESSION_SECRET_KEY || "ziyo-zukko-anti-bot-secure-key-2025";
const CHALLENGE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export interface CaptchaChallenge {
  question: string;
  token: string;
}

/**
 * Generates an anti-bot mathematical challenge with HMAC signature.
 */
export function generateCaptcha(): CaptchaChallenge {
  const num1 = Math.floor(Math.random() * 20) + 5;
  const num2 = Math.floor(Math.random() * 15) + 3;
  const isAddition = Math.random() > 0.3; // 70% addition, 30% subtraction

  const operator = isAddition ? "+" : "-";
  const a = isAddition ? num1 : Math.max(num1, num2);
  const b = isAddition ? num2 : Math.min(num1, num2);
  const answer = isAddition ? a + b : a - b;

  const timestamp = Date.now();
  const rawData = `${a}:${operator}:${b}:${answer}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(rawData).digest("hex");

  const token = `${a}:${operator}:${b}:${timestamp}:${hmac}`;
  const question = `${a} ${operator} ${b} = ?`;

  return { question, token };
}

/**
 * Validates the user's answer against the signed challenge token.
 */
export function verifyCaptcha(userAnswer: string | number, token: string): boolean {
  if (!token || userAnswer === undefined || userAnswer === null || userAnswer === "") {
    return false;
  }

  const parts = token.split(":");
  if (parts.length !== 5) {
    return false;
  }

  const [aStr, operator, bStr, timestampStr, signature] = parts;
  const a = parseInt(aStr, 10);
  const b = parseInt(bStr, 10);
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(a) || isNaN(b) || isNaN(timestamp)) {
    return false;
  }

  // Check expiration (5 minutes)
  const now = Date.now();
  if (now - timestamp > CHALLENGE_VALIDITY_MS || now < timestamp - 5000) {
    return false;
  }

  // Calculate correct answer
  const expectedAnswer = operator === "+" ? a + b : a - b;

  // Verify HMAC signature
  const rawData = `${a}:${operator}:${b}:${expectedAnswer}:${timestamp}`;
  const expectedHmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(rawData).digest("hex");

  // Constant-time comparison against timing attacks
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedSigBuffer = Buffer.from(expectedHmac, "hex");
  if (sigBuffer.length !== expectedSigBuffer.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return false;
  }

  // Compare parsed answers
  const parsedUserAnswer = parseInt(String(userAnswer).trim(), 10);
  return parsedUserAnswer === expectedAnswer;
}
