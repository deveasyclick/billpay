import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove keys with `undefined` or `null` values from an object.
 * Keeps 0, false, and empty strings since they might be valid values.
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as Partial<T>;
}

export function generateTxnRef(prefix = "TXN"): string {
  const timestamp = Date.now(); // millisecond precision
  const randomPart = Math.random().toString(36).substring(2, 8); // random alphanumeric
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  return `${prefix}-${date}-${timestamp}-${randomPart}`;
}
