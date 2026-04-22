import { AlertCircle, FileSearch, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import {
  formatStockResearchDateTime,
  getStockResearchStatusBadgeClassName,
  getStockResearchStatusLabel,
} from "@/features/stock-research/components/stock-research-page.utils"
import type { StockResearchReportSummary } from "@/features/stock-research/types"

type StockResearchHistoryRailProps = {
  isLoading: boolean
  isRefreshing?: boolean
  items: StockResearchReportSummary[]
  onRefresh: () => void
  onSelectReport: (reportId: string) => void
  selectedReportId?: string | null
  hasError?: boolean
}

const StockResearchHistoryRailSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`stock-research-history-skeleton-${index}`}
        className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/30 px-4 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    ))}
  </div>
)

export const StockResearchHistoryRail = ({
  hasError = false,
  isLoading,
  isRefreshing = false,
  items,
  onRefresh,
  onSelectReport,
  selectedReportId,
}: StockResearchHistoryRailProps) => {
  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-foreground">History</div>
            <div className="text-xs text-muted-foreground">Loading report summaries</div>
          </div>
          <Button type="button" variant="outline" size="sm" disabled>
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchHistoryRailSkeleton />
        </ScrollArea>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-4">
        <Empty className="border-destructive/30 bg-destructive/5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Unable to load research history</EmptyTitle>
            <EmptyDescription>
              Keep the research page open and retry when the report service is reachable.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCw data-icon="inline-start" />
            Retry
          </Button>
        </Empty>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-4">
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No research reports yet</EmptyTitle>
            <EmptyDescription>
              Queue a report from this page, the stock catalog, or watchlists to start building
              research history.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-foreground">History</div>
          <div className="text-xs text-muted-foreground">
            {items.length} persisted report{items.length === 1 ? "" : "s"}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw data-icon="inline-start" className={cn(isRefreshing ? "animate-spin" : undefined)} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {items.map((report) => {
            const isSelected = report.id === selectedReportId

            return (
              <button
                key={report.id}
                type="button"
                onClick={() => onSelectReport(report.id)}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                  isSelected
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-border/50 bg-background/30 hover:border-border hover:bg-background/55",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-semibold tracking-wide text-foreground">
                    {report.symbol}
                  </div>
                  <Badge
                    variant="outline"
                    className={getStockResearchStatusBadgeClassName(report.status)}
                  >
                    {getStockResearchStatusLabel(report.status)}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div>Created {formatStockResearchDateTime(report.created_at)}</div>
                  <div>Updated {formatStockResearchDateTime(report.updated_at)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
