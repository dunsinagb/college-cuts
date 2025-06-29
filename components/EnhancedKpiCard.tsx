import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

interface EnhancedKpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  loading?: boolean
}

export function EnhancedKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
}: EnhancedKpiCardProps) {
  return (
    <Card className="card-hover relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              {Icon && (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight gradient-text">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
