import { AlertCircle, FileSearch, PanelLeft, RefreshCw } from "lucide-react"

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
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import { cn } from "@/lib/utils"

import {
  formatStockResearchDateTime,
  getStockResearchStatusBadgeClassName,
  getStockResearchStatusLabel,
} from "@/features/stock-research/components/stock-research-page.utils"
import { StockResearchRuntimeBadges } from "@/features/stock-research/components/stock-research-runtime-badges"
import type { StockResearchReportSummary } from "@/features/stock-research/types"

type StockResearchHistoryRailProps = {
  className?: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  isLoading: boolean
  items: StockResearchReportSummary[]
  onLoadMore?: () => void
  onRefresh: () => void
  onToggleCollapse?: () => void
  onSelectReport: (reportId: string) => void
  selectedReportId?: string | null
  total?: number
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

const StockResearchHistoryRailHeader = ({
  description,
  onToggleCollapse,
}: {
  description: string
  onToggleCollapse?: () => void
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium text-foreground">History</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Hide history"
      className="hidden h-9 w-9 rounded-full border-border/70 bg-background/80 backdrop-blur-sm lg:inline-flex"
      onClick={onToggleCollapse}
    >
      <PanelLeft />
    </Button>
  </div>
)

export const StockResearchHistoryRail = ({
  className,
  hasError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading,
  items,
  onLoadMore,
  onRefresh,
  onToggleCollapse,
  onSelectReport,
  selectedReportId,
  total,
}: StockResearchHistoryRailProps) => {
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage,
    isEnabled: !isLoading && !hasError && items.length > 0,
    isFetchingNextPage,
    onLoadMore: () => {
      onLoadMore?.()
    },
  })

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
          className,
        )}
      >
        <StockResearchHistoryRailHeader
          description="Loading report summaries"
          onToggleCollapse={onToggleCollapse}
        />
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchHistoryRailSkeleton />
        </ScrollArea>
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
          className,
        )}
      >
        <StockResearchHistoryRailHeader
          description="Research history is temporarily unavailable"
          onToggleCollapse={onToggleCollapse}
        />
        <div className="p-4">
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
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
          className,
        )}
      >
        <StockResearchHistoryRailHeader
          description="No persisted reports yet"
          onToggleCollapse={onToggleCollapse}
        />
        <div className="p-4">
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
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
        className,
      )}
    >
      <StockResearchHistoryRailHeader
        description={`${total ?? items.length} persisted report${(total ?? items.length) === 1 ? "" : "s"}`}
        onToggleCollapse={onToggleCollapse}
      />

      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1">
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
                  <StockResearchRuntimeBadges
                    className="pt-1"
                    runtimeConfig={report.runtime_config}
                  />
                </div>
              </button>
            )
          })}

          {isFetchingNextPage ? <StockResearchHistoryRailSkeleton /> : null}
          {!hasNextPage ? (
            <div className="px-1 text-center text-[11px] tracking-wide text-muted-foreground uppercase">
              All {total ?? items.length} reports loaded
            </div>
          ) : null}
          <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
        </div>
      </ScrollArea>
    </div>
  )
}
