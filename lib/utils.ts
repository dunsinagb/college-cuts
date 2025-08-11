import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to show only month and year
 * @param dateString - ISO date string (e.g., "2024-03-15")
 * @returns Formatted string (e.g., "Mar 2024")
 */
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    year: "numeric" 
  })
}

/**
 * Formats a date string or Date object to show full month and year
 * @param dateInput - ISO date string (e.g., "2024-03-15") or Date object
 * @returns Formatted string (e.g., "March 2024")
 */
export function formatFullMonthYear(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  })
}
