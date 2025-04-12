import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Solana utilities
export async function getSolanaBalance(
  connection: Connection,
  publicKey: string
): Promise<number> {
  try {
    const key = new PublicKey(publicKey);
    const balance = await connection.getBalance(key);
    return balance / 1000000000; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    throw error;
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// API utilities
export async function fetchWithAuth<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function fetchWithAxios<T>(
  url: string,
  options: any = {}
): Promise<T> {
  try {
    const response = await axios.request({
      url,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error('Axios request failed:', error);
    throw error;
  }
}

// Date utilities
export function formatDate(date: Date | string, formatStr = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(
  date: Date | string,
  formatStr = 'PPP p'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function isToday(date: Date | string): boolean {
  const today = new Date();
  const compareDate = typeof date === 'string' ? parseISO(date) : date;
  
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
}

// String utilities
export function truncateString(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return `${str.slice(0, length)}...`;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Number utilities
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(
  num: number,
  decimals = 2,
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Object utilities
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Array utilities
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Async utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delay: number;
    onRetry?: (error: Error, attempt: number) => void;
  }
): Promise<T> {
  const { retries, delay, onRetry } = options;
  
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    if (onRetry) {
      onRetry(error as Error, options.retries);
    }
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    return retry(fn, {
      ...options,
      retries: retries - 1,
    });
  }
}
