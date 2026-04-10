import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, CUT_TYPE_COLORS, CUT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const variant = STATUS_COLORS[status] || "default";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

export function CutTypeBadge({ cutType, className }: { cutType: string; className?: string }) {
  const customClass = CUT_TYPE_COLORS[cutType] || "bg-gray-100 text-gray-800";
  const label = CUT_TYPE_LABELS[cutType] || cutType;
  return (
    <Badge variant="outline" className={cn("border-transparent", customClass, className)}>
      {label}
    </Badge>
  );
}
