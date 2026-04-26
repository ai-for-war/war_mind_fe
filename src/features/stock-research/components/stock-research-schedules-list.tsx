import {
  AlertCircle,
  CalendarClock,
  MoreHorizontal,
  Pause,
  PanelLeft,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { StockResearchRuntimeBadges } from "@/features/stock-research/components/stock-research-runtime-badges"
import {
  formatStockResearchScheduleCadence,
} from "@/features/stock-research/stock-research-schedules.utils"
import type { StockResearchScheduleSummary } from "@/features/stock-research/types"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import { formatAbsoluteDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"

type StockResearchSchedulesListProps = {
  className?: string
  hasError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  isLoading: boolean
  items: StockResearchScheduleSummary[]
  onDeleteSchedule?: (schedule: StockResearchScheduleSummary) => void
  onEditSchedule?: (schedule: StockResearchScheduleSummary) => void
  onLoadMore?: () => void
  onPauseSchedule?: (schedule: StockResearchScheduleSummary) => void
  onRefresh: () => void
  onResumeSchedule?: (schedule: StockResearchScheduleSummary) => void
  onSelectSchedule: (scheduleId: string) => void
  onToggleCollapse?: () => void
  selectedScheduleId?: string | null
  total?: number
}

const StockResearchSchedulesListSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`stock-research-schedule-list-skeleton-${index}`}
        className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/30 px-4 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
    ))}
  </div>
)

const StockResearchSchedulesListHeader = ({
  description,
  onToggleCollapse,
}: {
  description: string
  onToggleCollapse?: () => void
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium text-foreground">Schedules</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Hide schedules"
      className="hidden h-9 w-9 rounded-full border-border/70 bg-background/80 backdrop-blur-sm lg:inline-flex"
      onClick={onToggleCollapse}
    >
      <PanelLeft />
    </Button>
  </div>
)

export const StockResearchSchedulesList = ({
  className,
  hasError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading,
  items,
  onDeleteSchedule,
  onEditSchedule,
  onLoadMore,
  onPauseSchedule,
  onRefresh,
  onResumeSchedule,
  onSelectSchedule,
  onToggleCollapse,
  selectedScheduleId,
  total,
}: StockResearchSchedulesListProps) => {
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
        <StockResearchSchedulesListHeader
          description="Loading schedule summaries"
          onToggleCollapse={onToggleCollapse}
        />
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchSchedulesListSkeleton />
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
        <StockResearchSchedulesListHeader
          description="Schedules are temporarily unavailable"
          onToggleCollapse={onToggleCollapse}
        />
        <div className="p-4">
          <Empty className="border-destructive/30 bg-destructive/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="size-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Unable to load schedules</EmptyTitle>
              <EmptyDescription>
                Keep the schedules tab open and retry when the schedule service is reachable.
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
        <StockResearchSchedulesListHeader
          description="No recurring jobs yet"
          onToggleCollapse={onToggleCollapse}
        />
        <div className="p-4">
          <Empty className="border-border/60 bg-background/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No schedules yet</EmptyTitle>
              <EmptyDescription>
                Create a recurring research schedule for one stock symbol.
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
      <StockResearchSchedulesListHeader
        description={`${total ?? items.length} schedule${(total ?? items.length) === 1 ? "" : "s"}`}
        onToggleCollapse={onToggleCollapse}
      />

      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {items.map((schedule) => {
            const isSelected = schedule.id === selectedScheduleId

            return (
              <div
                key={schedule.id}
                className={cn(
                  "flex items-start gap-2 rounded-2xl border px-4 py-4 transition-colors",
                  isSelected
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-border/50 bg-background/30 hover:border-border hover:bg-background/55",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectSchedule(schedule.id)}
                  className="flex min-w-0 flex-1 flex-col gap-3 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold tracking-wide text-foreground">
                      {schedule.symbol}
                    </div>
                    <Badge
                      variant="outline"
                      className={getStockResearchScheduleStatusBadgeClassName(schedule.status)}
                    >
                      {getStockResearchScheduleStatusLabel(schedule.status)}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div>{formatStockResearchScheduleCadence(schedule.schedule)}</div>
                    <div>Next {formatAbsoluteDateTime(schedule.next_run_at)}</div>
                    <StockResearchRuntimeBadges
                      className="pt-1"
                      runtimeConfig={schedule.runtime_config}
                    />
                  </div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Open actions for ${schedule.symbol} schedule`}
                      className="size-8 shrink-0"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => onEditSchedule?.(schedule)}>
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      {schedule.status === "active" ? (
                        <DropdownMenuItem onSelect={() => onPauseSchedule?.(schedule)}>
                          <Pause />
                          Pause
                        </DropdownMenuItem>
                      ) : null}
                      {schedule.status === "paused" ? (
                        <DropdownMenuItem onSelect={() => onResumeSchedule?.(schedule)}>
                          <Play />
                          Resume
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onDeleteSchedule?.(schedule)}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}

          {isFetchingNextPage ? <StockResearchSchedulesListSkeleton /> : null}
          {!hasNextPage ? (
            <div className="px-1 text-center text-[11px] tracking-wide text-muted-foreground uppercase">
              All {total ?? items.length} schedules loaded
            </div>
          ) : null}
          <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
        </div>
      </ScrollArea>
    </div>
  )
}
