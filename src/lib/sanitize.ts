import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes user input to prevent XSS attacks
 * Uses DOMPurify to remove malicious HTML/JS while preserving safe content
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Trim whitespace and sanitize
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"], // Explicitly forbidden
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"], // Event handlers
  });
}

/**
 * Sanitizes HTML content (when HTML is needed)
 * Use this for rich text that should allow safe HTML tags
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/**
 * Sanitizes a complete object by sanitizing all string values
 * Recursively handles nested objects and arrays
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === "string" ? sanitizeInput(item) : item,
      );
    } else if (typeof value === "object" && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
      );
    } else {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }

  return sanitized;
}

/**
 * Password strength validator
 * Returns an object with strength level and feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    feedback.push("At least 8 characters");
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("One uppercase letter");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("One lowercase letter");
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push("One number");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push("One special character (!@#$%^&*)");
  } else {
    score += 1;
  }

  const isValid = score === 5;
  let strength: "weak" | "medium" | "strong" = "weak";

  if (score >= 4) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  return { isValid, strength, score, feedback };
}

/**
 * Password validation schema for Zod
 * Enforces: min 8 chars, uppercase, lowercase, number, special char
 */
export const passwordSchema = {
  validate: (password: string): boolean => {
    const result = validatePasswordStrength(password);
    return result.isValid;
  },
  message:
    "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
};
