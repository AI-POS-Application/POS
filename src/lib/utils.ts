import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in Indian Rupees
 * @param amount - The amount to format
 * @returns Formatted price string with ₹ symbol
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(0)}`
}

/**
 * Format price with decimal places for Indian Rupees
 * @param amount - The amount to format
 * @returns Formatted price string with ₹ symbol and 2 decimal places
 */
export function formatPriceWithDecimals(amount: number): string {
  return `₹${amount.toFixed(2)}`
}
