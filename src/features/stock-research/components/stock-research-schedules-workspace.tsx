import { AlertCircle, CalendarClock, Plus, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useStockResearchSchedules } from "@/features/stock-research/hooks"
import { formatStockResearchScheduleCadence } from "@/features/stock-research/stock-research-schedules.utils"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockResearchSchedulesWorkspaceProps = {
  onCreateSchedule: () => void
}

export const StockResearchSchedulesWorkspace = ({
  onCreateSchedule,
}: StockResearchSchedulesWorkspaceProps) => {
  const schedulesQuery = useStockResearchSchedules()
  const isRefreshing = schedulesQuery.isFetching

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
              Markets
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-secondary/70">
              {schedulesQuery.total} schedules
            </Badge>
            <Badge variant="outline" className="rounded-full border-amber-400/30 bg-amber-400/10 text-amber-100">
              Asia/Saigon
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Stock Research
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage recurring stock research schedules for the active organization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void schedulesQuery.refetch()}
            disabled={isRefreshing}
          >
            <RefreshCw data-icon="inline-start" className={isRefreshing ? "animate-spin" : undefined} />
            Refresh
          </Button>
          <Button type="button" onClick={onCreateSchedule}>
            <Plus data-icon="inline-start" />
            New Schedule
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/45">
        {schedulesQuery.isLoading ? (
          <div className="flex flex-1 flex-col gap-2 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`stock-research-schedule-shell-skeleton-${index}`}
                className="grid grid-cols-[0.8fr_1.2fr_1fr] gap-3 rounded-xl border border-border/40 px-4 py-3"
              >
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : null}

        {!schedulesQuery.isLoading && schedulesQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty className="border-destructive/30 bg-destructive/5">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircle className="size-5 text-destructive" />
                </EmptyMedia>
                <EmptyTitle>Unable to load research schedules</EmptyTitle>
                <EmptyDescription>
                  Keep the current workspace and retry the request when the service is reachable.
                </EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="outline" onClick={() => void schedulesQuery.refetch()}>
                <RefreshCw data-icon="inline-start" />
                Retry
              </Button>
            </Empty>
          </div>
        ) : null}

        {!schedulesQuery.isLoading &&
        !schedulesQuery.isError &&
        schedulesQuery.items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
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
              <Button type="button" onClick={onCreateSchedule}>
                <Plus data-icon="inline-start" />
                New Schedule
              </Button>
            </Empty>
          </div>
        ) : null}

        {!schedulesQuery.isLoading &&
        !schedulesQuery.isError &&
        schedulesQuery.items.length > 0 ? (
          <ScrollArea className="h-full min-h-0 flex-1 pr-2">
            <div className="flex min-w-full flex-col divide-y divide-border/50">
              {schedulesQuery.items.map((schedule) => (
                <div
                  key={schedule.id}
                  className="grid grid-cols-[0.7fr_1.3fr_1fr_1fr] gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-medium tracking-[0.12em] uppercase">
                    {schedule.symbol}
                  </span>
                  <span className="text-muted-foreground">
                    {formatStockResearchScheduleCadence(schedule.schedule)}
                  </span>
                  <span className="capitalize text-muted-foreground">
                    {schedule.status}
                  </span>
                  <span className="text-muted-foreground">
                    {formatAbsoluteDateTime(schedule.next_run_at)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </section>
  )
}
