import { Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StockResearchScheduleDetailPanel } from "@/features/stock-research/components/stock-research-schedule-detail-panel"
import { StockResearchSchedulesList } from "@/features/stock-research/components/stock-research-schedules-list"
import {
  useStockResearchSchedule,
  useStockResearchSchedules,
} from "@/features/stock-research/hooks"

type StockResearchSchedulesWorkspaceProps = {
  onCreateSchedule: () => void
}

export const StockResearchSchedulesWorkspace = ({
  onCreateSchedule,
}: StockResearchSchedulesWorkspaceProps) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const schedulesQuery = useStockResearchSchedules()
  const activeScheduleSummary = useMemo(
    () =>
      schedulesQuery.items.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedulesQuery.items, selectedScheduleId],
  )
  const activeScheduleQuery = useStockResearchSchedule({
    scheduleId: activeScheduleSummary?.id ?? null,
  })
  const isRefreshing =
    schedulesQuery.isFetching ||
    (activeScheduleSummary != null && activeScheduleQuery.isFetching)

  const handleRefresh = async () => {
    const refreshTasks: Promise<unknown>[] = [schedulesQuery.refetch()]

    if (activeScheduleSummary != null) {
      refreshTasks.push(activeScheduleQuery.refetch())
    }

    await Promise.all(refreshTasks)
  }

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
            onClick={() => void handleRefresh()}
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

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 lg:flex-row">
        <div className="min-h-0 max-h-[18rem] overflow-hidden lg:max-h-none lg:basis-[20rem] lg:shrink-0 xl:basis-[22rem]">
          <StockResearchSchedulesList
            className="rounded-none border-0 border-b border-border/60 bg-transparent lg:border-b-0 lg:border-r"
            hasNextPage={schedulesQuery.hasNextPage}
            hasError={schedulesQuery.isError}
            isFetchingNextPage={schedulesQuery.isFetchingNextPage}
            isLoading={schedulesQuery.isLoading}
            items={schedulesQuery.items}
            onLoadMore={() => void schedulesQuery.fetchNextPage()}
            onRefresh={() => void handleRefresh()}
            onSelectSchedule={setSelectedScheduleId}
            selectedScheduleId={activeScheduleSummary?.id ?? null}
            total={schedulesQuery.total}
          />
        </div>

        <StockResearchScheduleDetailPanel
          activeSchedule={activeScheduleQuery.schedule}
          activeScheduleSummary={activeScheduleSummary}
          className="rounded-none border-0 bg-transparent"
          hasError={activeScheduleQuery.isError}
          isLoading={activeScheduleQuery.isLoading}
          onRefresh={() => void handleRefresh()}
        />
      </div>
    </section>
  )
}
