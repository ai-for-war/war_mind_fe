import { AlertCircle, CalendarClock, FileSearch, RefreshCw } from "lucide-react"

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
import {
  getStockResearchScheduleStatusBadgeClassName,
  getStockResearchScheduleStatusLabel,
} from "@/features/stock-research/components/stock-research-schedules.utils"
import { StockResearchRuntimeChip } from "@/features/stock-research/components/stock-research-runtime-chip"
import {
  formatStockResearchScheduleCadence,
  formatStockResearchScheduleHour,
  formatStockResearchScheduleWeekdays,
} from "@/features/stock-research/stock-research-schedules.utils"
import type {
  StockResearchScheduleResponse,
  StockResearchScheduleSummary,
} from "@/features/stock-research/types"
import { formatAbsoluteDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"

type StockResearchScheduleDetailPanelProps = {
  activeSchedule: StockResearchScheduleResponse | null
  activeScheduleSummary: StockResearchScheduleSummary | null
  className?: string
  hasError?: boolean
  isLoading: boolean
  onRefresh: () => void
}

const StockResearchScheduleDetailPanelSkeleton = () => (
  <div className="flex flex-col gap-6 p-5">
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={`stock-research-schedule-detail-skeleton-${index}`}
          className="h-16 rounded-xl"
        />
      ))}
    </div>
  </div>
)

const StockResearchScheduleDetailItem = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border/50 bg-background/30 px-4 py-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="min-w-0 truncate text-sm font-medium text-foreground">{value}</dd>
  </div>
)

export const StockResearchScheduleDetailPanel = ({
  activeSchedule,
  activeScheduleSummary,
  className,
  hasError = false,
  isLoading,
  onRefresh,
}: StockResearchScheduleDetailPanelProps) => {
  if (activeScheduleSummary == null) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6",
          className,
        )}
      >
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No schedule selected</EmptyTitle>
            <EmptyDescription>
              Select a schedule from the list to inspect its cadence and runtime snapshot.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
          className,
        )}
      >
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchScheduleDetailPanelSkeleton />
        </ScrollArea>
      </div>
    )
  }

  if (hasError || activeSchedule == null) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6",
          className,
        )}
      >
        <Empty className="border-destructive/30 bg-destructive/5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Unable to load schedule detail</EmptyTitle>
            <EmptyDescription>
              Keep this schedule selected and retry when the detail endpoint is reachable again.
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

  const hourLabel = formatStockResearchScheduleHour(activeSchedule.schedule.hour)
  const weekdayLabel = formatStockResearchScheduleWeekdays(
    activeSchedule.schedule.weekdays,
    "Not used",
  )

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
        className,
      )}
    >
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {activeSchedule.symbol}
            </h2>
            <Badge
              variant="outline"
              className={getStockResearchScheduleStatusBadgeClassName(activeSchedule.status)}
            >
              {getStockResearchScheduleStatusLabel(activeSchedule.status)}
            </Badge>
            <StockResearchRuntimeChip runtimeConfig={activeSchedule.runtime_config} />
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 min-w-0 flex-1">
        <div className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/30 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarClock className="size-4 text-muted-foreground" />
              {formatStockResearchScheduleCadence(activeSchedule.schedule)}
            </div>
            <p className="text-sm text-muted-foreground">
              Daily and weekly hours are interpreted by the backend as Vietnam time.
            </p>
          </div>

          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <StockResearchScheduleDetailItem
              label="Cadence"
              value={activeSchedule.schedule.type.replaceAll("_", " ")}
            />
            <StockResearchScheduleDetailItem label="Hour" value={hourLabel} />
            <StockResearchScheduleDetailItem label="Weekdays" value={weekdayLabel} />
            <StockResearchScheduleDetailItem
              label="Next run"
              value={formatAbsoluteDateTime(activeSchedule.next_run_at)}
            />
            <StockResearchScheduleDetailItem
              label="Created"
              value={formatAbsoluteDateTime(activeSchedule.created_at)}
            />
            <StockResearchScheduleDetailItem
              label="Updated"
              value={formatAbsoluteDateTime(activeSchedule.updated_at)}
            />
          </dl>
        </div>
      </ScrollArea>
    </div>
  )
}
