import { clsx, type ClassValue } from "clsx";
import { format, isSameDay } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to "MM/DD/YYYY h:mm AM/PM" format
 * @param date - Date object, ISO string, or timestamp
 * @param options - Optional formatting options
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  options?: {
    includeSeconds?: boolean;
    timezone?: string;
  },
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(options?.includeSeconds && { second: "2-digit" }),
      ...(options?.timezone && { timeZone: options.timezone }),
    };

    return dateObj.toLocaleString("en-US", formatOptions);
  } catch {
    return "";
  }
}

/**
 * Format a date to "MM/DD/YYYY" format (date only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date to "h:mm AM/PM" format (time only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted time string or empty string if invalid
 */
export function formatTime(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/**
 * Format a UTC date to local long format (e.g., "January 11, 2026, 8:30 PM")
 * @param date - Date object, ISO string (UTC), or timestamp
 * @param locale - Optional locale string (defaults to "en-US")
 * @returns Formatted date string in local timezone or empty string if invalid
 */
export function formatDateTimeLong(
  date: Date | string | number | null | undefined,
  locale: string = "en-US",
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param date - Date object, ISO string, or timestamp
 * @returns Relative time string or empty string if invalid
 */
export function formatRelativeTime(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffDay) >= 1) {
      return rtf.format(diffDay, "day");
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(diffHour, "hour");
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(diffMin, "minute");
    } else {
      return rtf.format(diffSec, "second");
    }
  } catch {
    return "";
  }
}

/**
 * Safely parse JSON from a string
 * @param data - JSON string to parse
 * @returns Parsed object or null if invalid
 */
export function safeParseJSON<T>(data: string | null): T | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Validate registration data structure
 * @param data - Object to validate
 * @returns True if data matches the expected registration data structure
 */
export function isValidRegistrationData(data: unknown): data is {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode?: string;
} {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.email === "string" &&
    typeof obj.firstName === "string" &&
    typeof obj.lastName === "string" &&
    typeof obj.phone === "string"
  );
}
export function formatEventDateTime(
  start: string | number | Date,
  end: string | number | Date,
) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = isSameDay(startDate, endDate);

  const startStr = format(startDate, "MMM dd, yyyy hh:mm a");
  const endStr = sameDay
    ? format(endDate, "hh:mm a")
    : format(endDate, "MMM dd, yyyy hh:mm a");

  return {
    isSameDay: sameDay,
    start: startStr,
    end: endStr,
    full: `${startStr} - ${endStr}`,
  };
}

/**
 * Format a currency amount using the user's locale
 * @param amount - The amount to format
 * @param currency - The currency code (e.g. "USD", "EUR")
 * @returns Formatted currency string
 */
// export const formatCurrency = (amount: number, currency: string, locale: string) => {
//   // we have three languages japaneses english and italian if currency is not available use currency based on language
//   const currencyMap: Record<string, string> = {
//     ja: "JPY",
//     en: "USD",
//     it: "EUR",
//   };
//   const resolvedCurrency = currencyMap[locale] || currency;

//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: resolvedCurrency,
//   }).format(amount);
// };

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en",
) => {
  const hasFraction = amount % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
};

/**
 * Generate a unique idempotency key for API requests
 * @returns A unique string suitable for use as an idempotency key
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
}
