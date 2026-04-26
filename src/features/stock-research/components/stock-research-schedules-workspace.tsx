import { PanelLeft, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StockResearchScheduleDetailPanel } from "@/features/stock-research/components/stock-research-schedule-detail-panel"
import { StockResearchScheduleDialog } from "@/features/stock-research/components/stock-research-schedule-dialog"
import { StockResearchSchedulesList } from "@/features/stock-research/components/stock-research-schedules-list"
import {
  useDeleteStockResearchSchedule,
  usePauseStockResearchSchedule,
  useResumeStockResearchSchedule,
  useStockResearchSchedule,
  useStockResearchSchedules,
} from "@/features/stock-research/hooks"
import { getStockResearchApiErrorMessage } from "@/features/stock-research/stock-research.utils"
import type { StockResearchScheduleResponse } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchSchedulesWorkspaceProps = {
  onCreateSchedule: () => void
}

export const StockResearchSchedulesWorkspace = ({
  onCreateSchedule,
}: StockResearchSchedulesWorkspaceProps) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] =
    useState<StockResearchScheduleResponse | null>(null)
  const [pendingDeleteSchedule, setPendingDeleteSchedule] =
    useState<StockResearchScheduleResponse | null>(null)
  const [isSchedulesCollapsed, setIsSchedulesCollapsed] = useState(false)
  const schedulesQuery = useStockResearchSchedules()
  const pauseScheduleMutation = usePauseStockResearchSchedule()
  const resumeScheduleMutation = useResumeStockResearchSchedule()
  const deleteScheduleMutation = useDeleteStockResearchSchedule()
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

  const handlePauseSchedule = async (schedule: StockResearchScheduleResponse) => {
    try {
      const pausedSchedule = await pauseScheduleMutation.mutateAsync({
        scheduleId: schedule.id,
      })

      toast.success(`Paused research schedule for ${pausedSchedule.symbol}.`)
    } catch (error) {
      toast.error(getStockResearchApiErrorMessage(error))
    }
  }

  const handleResumeSchedule = async (schedule: StockResearchScheduleResponse) => {
    try {
      const resumedSchedule = await resumeScheduleMutation.mutateAsync({
        scheduleId: schedule.id,
      })

      toast.success(`Resumed research schedule for ${resumedSchedule.symbol}.`)
    } catch (error) {
      toast.error(getStockResearchApiErrorMessage(error))
    }
  }

  const handleConfirmDeleteSchedule = async () => {
    if (pendingDeleteSchedule == null) {
      return
    }

    try {
      await deleteScheduleMutation.mutateAsync({
        scheduleId: pendingDeleteSchedule.id,
      })

      if (selectedScheduleId === pendingDeleteSchedule.id) {
        setSelectedScheduleId(null)
      }

      toast.success(`Deleted research schedule for ${pendingDeleteSchedule.symbol}.`)
      setPendingDeleteSchedule(null)
    } catch (error) {
      toast.error(getStockResearchApiErrorMessage(error))
    }
  }

  return (
    <>
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
          <div
            className={cn(
              "min-h-0 overflow-hidden lg:shrink-0 lg:will-change-[flex-basis,max-width] lg:transition-[flex-basis,max-width] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
              isSchedulesCollapsed
                ? "max-h-[18rem] lg:max-h-none lg:basis-[3.75rem] lg:max-w-[3.75rem]"
                : "max-h-[18rem] lg:max-h-none lg:basis-[20rem] lg:max-w-[20rem] xl:basis-[22rem] xl:max-w-[22rem]",
            )}
          >
            <div className="relative flex h-full min-h-0 min-w-0">
              <div
                className={cn(
                  "hidden h-full min-h-0 w-full flex-col items-center border-r border-border/60 bg-background/20 transition-[opacity,transform] duration-200 ease-out lg:flex",
                  isSchedulesCollapsed
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none absolute inset-0 -translate-x-3 opacity-0",
                )}
              >
                <div className="flex h-full min-h-0 w-full flex-col items-center gap-4 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Show schedules"
                    aria-expanded={false}
                    className="h-9 w-9 rounded-full border-border/70 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsSchedulesCollapsed(false)}
                  >
                    <PanelLeft className="rotate-180" />
                  </Button>
                  <div className="flex flex-1 items-center">
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                      Schedules
                    </span>
                  </div>
                </div>
              </div>

              <StockResearchSchedulesList
                className={cn(
                  "rounded-none border-0 border-b border-border/60 bg-transparent transition-[opacity,transform] duration-200 ease-out lg:border-b-0 lg:border-r",
                  isSchedulesCollapsed
                    ? "pointer-events-none translate-x-3 opacity-0"
                    : "translate-x-0 opacity-100",
                )}
                hasNextPage={schedulesQuery.hasNextPage}
                hasError={schedulesQuery.isError}
                isFetchingNextPage={schedulesQuery.isFetchingNextPage}
                isLoading={schedulesQuery.isLoading}
                items={schedulesQuery.items}
                onDeleteSchedule={setPendingDeleteSchedule}
                onEditSchedule={setEditingSchedule}
                onLoadMore={() => void schedulesQuery.fetchNextPage()}
                onPauseSchedule={(schedule) => void handlePauseSchedule(schedule)}
                onRefresh={() => void handleRefresh()}
                onResumeSchedule={(schedule) => void handleResumeSchedule(schedule)}
                onSelectSchedule={setSelectedScheduleId}
                onToggleCollapse={() => setIsSchedulesCollapsed(true)}
                selectedScheduleId={activeScheduleSummary?.id ?? null}
                total={schedulesQuery.total}
              />
            </div>
          </div>

          <StockResearchScheduleDetailPanel
            activeSchedule={activeScheduleQuery.schedule}
            activeScheduleSummary={activeScheduleSummary}
            className="rounded-none border-0 bg-transparent"
            hasError={activeScheduleQuery.isError}
            isLoading={activeScheduleQuery.isLoading}
            onDeleteSchedule={setPendingDeleteSchedule}
            onEditSchedule={setEditingSchedule}
            onPauseSchedule={(schedule) => void handlePauseSchedule(schedule)}
            onRefresh={() => void handleRefresh()}
            onResumeSchedule={(schedule) => void handleResumeSchedule(schedule)}
          />
        </div>
      </section>

      <StockResearchScheduleDialog
        open={editingSchedule != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSchedule(null)
          }
        }}
        initialSchedule={editingSchedule}
        onSaved={(savedSchedule) => {
          setSelectedScheduleId(savedSchedule.id)
          setEditingSchedule(null)
        }}
      />

      <AlertDialog
        open={pendingDeleteSchedule != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteSchedule(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete research schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the recurring schedule for{" "}
              <span className="font-medium text-foreground">
                {pendingDeleteSchedule?.symbol ?? "this symbol"}
              </span>
              . Existing research reports are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteScheduleMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteScheduleMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                void handleConfirmDeleteSchedule()
              }}
            >
              Delete Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
