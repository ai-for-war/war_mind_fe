import { Plus, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StockResearchCreateReportDialog } from "@/features/stock-research/components/stock-research-create-report-dialog"
import { StockResearchDetailPanel } from "@/features/stock-research/components/stock-research-detail-panel"
import { StockResearchHistoryRail } from "@/features/stock-research/components/stock-research-history-rail"
import { useStockResearchWorkspace } from "@/features/stock-research/hooks"

export const StockResearchPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
                {reportsQuery.items.length} reports
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

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[22rem_minmax(0,1fr)]">
          <StockResearchHistoryRail
            hasError={reportsQuery.isError}
            isLoading={reportsQuery.isLoading}
            isRefreshing={isRefreshing}
            items={reportsQuery.items}
            onRefresh={() => void refreshWorkspace()}
            onSelectReport={setActiveReportId}
            selectedReportId={activeReportId}
          />

          <StockResearchDetailPanel
            activeReport={activeReport}
            activeReportSummary={activeReportSummary}
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
