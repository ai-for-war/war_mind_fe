import { PanelLeft, Plus, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StockResearchCreateReportDialog } from "@/features/stock-research/components/stock-research-create-report-dialog"
import { StockResearchDetailPanel } from "@/features/stock-research/components/stock-research-detail-panel"
import { StockResearchHistoryRail } from "@/features/stock-research/components/stock-research-history-rail"
import { useStockResearchWorkspace } from "@/features/stock-research/hooks"
import { cn } from "@/lib/utils"

export const StockResearchPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  const {
    activeReport,
    activeReportQuery,
    activeReportSummary,
    activeReportId,
    refreshWorkspace,
    reportsQuery,
    setActiveReportId,
  } = useStockResearchWorkspace()
  const isRefreshing =
    reportsQuery.isFetching || (activeReportId != null && activeReportQuery.isFetching)

  return (
    <>
      <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                Markets
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary/70">
                {reportsQuery.total} reports
              </Badge>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Stock Research
              </h1>
              <p className="text-sm text-muted-foreground">
                Review persisted markdown reports, inspect source references, and refresh snapshots
                for the active organization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshWorkspace()}
              disabled={isRefreshing}
            >
              <RefreshCw data-icon="inline-start" className={isRefreshing ? "animate-spin" : undefined} />
              Refresh
            </Button>
            <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              New Report
            </Button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 lg:flex-row">
          <div
            className={cn(
              "min-h-0 overflow-hidden lg:shrink-0 lg:will-change-[flex-basis,max-width] lg:transition-[flex-basis,max-width] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
              isHistoryCollapsed
                ? "max-h-[18rem] lg:max-h-none lg:basis-[3.75rem] lg:max-w-[3.75rem]"
                : "max-h-[18rem] lg:max-h-none lg:basis-[18rem] lg:max-w-[18rem] xl:basis-[19rem] xl:max-w-[19rem]",
            )}
          >
            <div className="relative flex h-full min-h-0 min-w-0">
              <div
                className={cn(
                  "hidden h-full min-h-0 w-full flex-col items-center border-r border-border/60 bg-background/20 transition-[opacity,transform] duration-200 ease-out lg:flex",
                  isHistoryCollapsed
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none absolute inset-0 -translate-x-3 opacity-0",
                )}
              >
                <div className="flex h-full min-h-0 w-full flex-col items-center gap-4 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Show history"
                    aria-expanded={false}
                    className="h-9 w-9 rounded-full border-border/70 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsHistoryCollapsed(false)}
                  >
                    <PanelLeft className="rotate-180" />
                  </Button>
                  <div className="flex flex-1 items-center">
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                      History
                    </span>
                  </div>
                </div>
              </div>

              <StockResearchHistoryRail
                className={cn(
                  "rounded-none border-0 border-b border-border/60 bg-transparent transition-[opacity,transform] duration-200 ease-out lg:border-b-0 lg:border-r",
                  isHistoryCollapsed
                    ? "pointer-events-none translate-x-3 opacity-0"
                    : "translate-x-0 opacity-100",
                )}
                hasNextPage={reportsQuery.hasNextPage}
                hasError={reportsQuery.isError}
                isFetchingNextPage={reportsQuery.isFetchingNextPage}
                isLoading={reportsQuery.isLoading}
                items={reportsQuery.items}
                onLoadMore={() => void reportsQuery.fetchNextPage()}
                onRefresh={() => void refreshWorkspace()}
                onToggleCollapse={() => setIsHistoryCollapsed(true)}
                onSelectReport={setActiveReportId}
                selectedReportId={activeReportId}
                total={reportsQuery.total}
              />
            </div>
          </div>

          <StockResearchDetailPanel
            activeReport={activeReport}
            activeReportSummary={activeReportSummary}
            className="rounded-none border-0 bg-transparent"
            hasError={activeReportQuery.isError}
            isLoading={activeReportQuery.isLoading}
            onRefresh={() => void refreshWorkspace()}
          />
        </div>
      </section>

      <StockResearchCreateReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create stock research report"
        description="Queue a new report for one symbol. The research workspace updates when you refresh it."
      />
    </>
  )
}
