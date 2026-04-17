export const CATEGORY_LABELS: Record<string, string> = {
  Academic: "Academic",
  Athletics: "Athletics",
  Administrative: "Administrative",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Athletics: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Administrative: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export const CUT_TYPE_LABELS: Record<string, string> = {
  program_suspension: "Program Suspension",
  teach_out: "Teach-Out",
  department_closure: "Department Closure",
  campus_closure: "Campus Closure",
  institution_closure: "Institution Closure",
  staff_layoff: "Staff Layoff",
};

export const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default", // will style blue
  ongoing: "secondary", // will style orange
  reversed: "outline", // will style teal
  rumor: "secondary", // will style yellow
};

export const CUT_TYPE_COLORS: Record<string, string> = {
  program_suspension: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  teach_out: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  department_closure: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  campus_closure: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  institution_closure: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300 font-semibold",
  staff_layoff: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
