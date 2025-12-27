import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Combines class names using clsx and merges Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using date-fns
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP') {
  return format(new Date(date), formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() ?? '';
  return (
    (parts[0]?.charAt(0).toUpperCase() ?? '') +
    (parts[parts.length - 1]?.charAt(0).toUpperCase() ?? '')
  );
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if we're running on the server side
 */
export const isServer = typeof window === 'undefined';

/**
 * Format a number with commas (e.g., 1000 -> 1,000)
 */
export function formatNumber(num: number) {
  return num.toLocaleString();
}

/**
 * Format a number in compact form (e.g., 1000 -> 1K)
 */
export function formatCompactNumber(num: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Parse URL search params into an object
 */
export function parseSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Create URL with search params
 */
export function createUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}
