interface SectionAxisProps {
  label: string;
  dark?: boolean;
  className?: string;
}

export function SectionAxis({ label, dark = false, className = "" }: SectionAxisProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <span
        className="text-[11px] font-bold uppercase tracking-[0.14em] shrink-0"
        style={{ color: "#f59e0b" }}
      >
        {label}
      </span>
      <div className={`flex-1 h-px ${dark ? "bg-white/15" : "bg-gray-200"}`} />
    </div>
  );
}
