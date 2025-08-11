/**
 * STATUS METHODOLOGY
 * 
 * This file defines the standardized color system for status categories across the CollegeCuts platform.
 * 
 * STATUS CATEGORIES:
 * - confirmed: Blue - Verified actions that have been officially announced
 * - ongoing: Orange - Actions currently in progress or being implemented
 * - reversed: Teal - Actions that were announced but later cancelled/reversed
 * - rumor: Yellow - Unverified reports that need confirmation
 * 
 * METHODOLOGY:
 * 1. All status colors are consistent across the entire application
 * 2. Colors are semantic (e.g., red for active issues, green for resolved)
 * 3. Both lowercase (database) and uppercase (display) versions are supported
 * 4. NULL values are excluded from filtering but handled gracefully in display
 * 
 * USAGE:
 * Import these constants in any component that displays status badges:
 * import { STATUS_COLORS, CUT_TYPE_COLORS, CATEGORY_COLORS } from "@/lib/constants"
 */

// Status color mapping for consistent styling across the app
export const STATUS_COLORS: Record<string, string> = {
  // Actual database values (from the image)
  "confirmed": "bg-blue-50 text-blue-700 border-blue-200",
  "ongoing": "bg-orange-50 text-orange-700 border-orange-200",
  "reversed": "bg-teal-50 text-teal-700 border-teal-200",
  "rumor": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "NULL": "bg-gray-50 text-gray-500 border-gray-200",
  
  // Additional statuses for completeness
  "active": "bg-red-50 text-red-700 border-red-200",
  "resolved": "bg-green-50 text-green-700 border-green-200",
  "pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "cancelled": "bg-gray-50 text-gray-700 border-gray-200",
  "suspended": "bg-amber-50 text-amber-700 border-amber-200",
  "under review": "bg-purple-50 text-purple-700 border-purple-200",
  
  // Uppercase versions (for consistency)
  "Active": "bg-red-50 text-red-700 border-red-200",
  "Resolved": "bg-green-50 text-green-700 border-green-200",
  "Pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Confirmed": "bg-blue-50 text-blue-700 border-blue-200",
  "Under Review": "bg-purple-50 text-purple-700 border-purple-200",
  "Ongoing": "bg-orange-50 text-orange-700 border-orange-200",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-gray-50 text-gray-700 border-gray-200",
  "Suspended": "bg-amber-50 text-amber-700 border-amber-200",
  "Reversed": "bg-teal-50 text-teal-700 border-teal-200",
  "Rumor": "bg-yellow-50 text-yellow-700 border-yellow-200"
}

/**
 * CUT TYPE METHODOLOGY:
 * 
 * Defines colors for different types of higher education actions:
 * - program_suspension: Yellow - Temporary program suspension
 * - teach_out: Orange - Gradual program closure with student completion
 * - department_closure: Red - Permanent department shutdown
 * - campus_closure: Rose - Campus-level closure
 * - institution_closure: Gray - Full institution closure
 * - staff_layoff: Purple - Personnel reductions
 */

// Cut type color mapping
export const CUT_TYPE_COLORS: Record<string, string> = {
  program_suspension: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  teach_out: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  department_closure: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  campus_closure: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  institution_closure: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  staff_layoff: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
}

/**
 * CATEGORY METHODOLOGY:
 * 
 * Defines colors for the primary reasons behind higher education actions.
 * Categories are automatically determined from the notes field using the categorizeCut() function.
 * This helps users understand the underlying causes of program cuts and closures.
 */

// Category color mapping
export const CATEGORY_COLORS: Record<string, string> = {
  "Budget Deficit": "bg-red-50 text-red-700 border-red-200",
  "Enrollment Decline": "bg-blue-50 text-blue-700 border-blue-200", 
  "Federal Funding Cuts": "bg-purple-50 text-purple-700 border-purple-200",
  "State Mandates": "bg-green-50 text-green-700 border-green-200",
  "Financial Mismanagement": "bg-orange-50 text-orange-700 border-orange-200",
  "Strategic Restructuring": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Political Pressure": "bg-pink-50 text-pink-700 border-pink-200",
  "Operational Costs": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Accreditation Issues": "bg-gray-50 text-gray-700 border-gray-200"
} 