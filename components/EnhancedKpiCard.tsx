import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

interface EnhancedKpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  loading?: boolean
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function EnhancedKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  trend,
  trendValue,
}: EnhancedKpiCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
      case "down":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30"
    }
  }

  return (
    <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              {Icon && (
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold tracking-tight">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                {subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
                {trendValue && (
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}
                  >
                    {trendValue}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
