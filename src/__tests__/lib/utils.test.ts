import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  capitalize,
  truncate,
  getInitials,
  formatNumber,
  formatCompactNumber,
  formatFileSize,
  generateRandomString,
  debounce,
  throttle,
  isEmpty,
  parseSearchParams,
} from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const falseCondition = false;
    const trueCondition = true;
    expect(cn('foo', falseCondition && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', trueCondition && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should merge Tailwind classes intelligently', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should handle already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should handle multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('should handle extra spaces', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });
});

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(1)).toBe('1');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });
});

describe('formatCompactNumber', () => {
  it('should format thousands as K', () => {
    expect(formatCompactNumber(1000)).toBe('1K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('should format millions as M', () => {
    expect(formatCompactNumber(1000000)).toBe('1M');
  });

  it('should handle small numbers', () => {
    expect(formatCompactNumber(100)).toBe('100');
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500.0 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});

describe('generateRandomString', () => {
  it('should generate string of default length', () => {
    const result = generateRandomString();
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it('should generate string of specified length', () => {
    const result = generateRandomString(12);
    expect(result.length).toBeLessThanOrEqual(12);
  });

  it('should generate different strings on each call', () => {
    const str1 = generateRandomString(16);
    const str2 = generateRandomString(16);
    expect(str1).not.toBe(str2);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);

    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle function calls', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to throttled function', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1', 'arg2');

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty({ key: 'value' })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

describe('parseSearchParams', () => {
  it('should parse search params into object', () => {
    const params = new URLSearchParams('foo=bar&baz=qux');
    const result = parseSearchParams(params);

    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('should handle empty search params', () => {
    const params = new URLSearchParams('');
    const result = parseSearchParams(params);

    expect(result).toEqual({});
  });

  it('should handle URL encoded values', () => {
    const params = new URLSearchParams('name=John%20Doe&email=test%40example.com');
    const result = parseSearchParams(params);

    expect(result).toEqual({ name: 'John Doe', email: 'test@example.com' });
  });
});
